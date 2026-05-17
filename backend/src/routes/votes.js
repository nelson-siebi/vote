const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const paymentService = require('../services/paymentService');

const VOTE_PRICE = 100; // FCFA par vote

// POST /api/votes/initiate — Étape 1 : créer le vote PENDING et lancer le paiement
router.post('/initiate', async (req, res) => {
  const { artistId, voterName, voterEmail, voteCount, paymentMethod, paymentPhone } = req.body;

  // ── Validation
  if (!artistId || !voterName || !voterEmail || !voteCount || !paymentMethod || !paymentPhone) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
  }
  if (!['MTN', 'ORANGE'].includes(paymentMethod.toUpperCase())) {
    return res.status(400).json({ success: false, message: 'Opérateur invalide.' });
  }
  const count = parseInt(voteCount);
  if (isNaN(count) || count < 1) {
    return res.status(400).json({ success: false, message: 'Nombre de votes invalide.' });
  }

  const amountFcfa = count * VOTE_PRICE;
  const voteId = uuidv4();

    try {
      // ── Récupérer les URLs de configuration depuis la DB
      const [[settings]] = await db.query('SELECT backend_url FROM site_settings WHERE id = 1');
      const baseBackendUrl = settings?.backend_url || process.env.BACKEND_URL || 'http://localhost:5000';

      // ── Vérifier que l'artiste existe
      const [[artist]] = await db.query('SELECT id, name FROM artists WHERE id = ? AND is_active = 1', [artistId]);
      if (!artist) return res.status(404).json({ success: false, message: 'Artiste introuvable.' });

      // ── Enregistrer le vote en PENDING
      await db.query(
        `INSERT INTO votes (id, artist_id, voter_name, voter_email, vote_count, amount_fcfa,
                            payment_method, payment_phone, payment_status, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
        [voteId, artistId, voterName, voterEmail, count, amountFcfa,
         paymentMethod.toUpperCase(), paymentPhone,
         getIP(req), req.headers['user-agent'] || null]
      );

      // ── Appel NelsiusPay via notre Service
      try {
        const result = await paymentService.directCharge({
          amount: amountFcfa,
          currency: 'XAF',
          phone: paymentPhone,
          operator: paymentMethod.toUpperCase(),
          description: `${count} vote(s) pour ${artist.name} - BeatVote`,
          reference: voteId,
          callbackUrl: `${baseBackendUrl}/api/votes/callback`,
          metadata: { voteId, artistId, voterEmail }
        });

      if (result.success) {
        // Si c'est une simulation, on confirme direct (pour le dev)
        if (result.simulation) {
          await confirmVote(voteId, result.transactionId);
          return res.json({
            success: true,
            voteId,
            transactionId: result.transactionId,
            message: `Vote confirmé (Simulation) !`,
          });
        }

        // Sinon (cas réel), on attend le webhook ou la confirmation mobile
        // 💾 On sauvegarde le transactionId pour pouvoir faire du polling plus tard
        if (result.transactionId) {
          await db.query('UPDATE votes SET transaction_id = ? WHERE id = ?', [result.transactionId, voteId]);
        }

        return res.json({
          success: true,
          voteId,
          message: 'Paiement initié. Veuillez confirmer sur votre téléphone.',
        });
      } else {
        await db.query('UPDATE votes SET payment_status = ? WHERE id = ?', ['FAILED', voteId]);
        return res.status(402).json({ success: false, message: result.message || 'Échec du paiement.' });
      }
    } catch (payErr) {
      console.error('NelsiusPay Execution Error:', payErr.message);
      
      // Si l'erreur vient de notre vérification de clé manquante, on l'affiche à l'utilisateur/développeur
      if (payErr.message && payErr.message.includes('Clé API NelsiusPay manquante')) {
         return res.status(500).json({ success: false, message: payErr.message });
      }

      return res.status(500).json({ success: false, message: 'Erreur lors du traitement du paiement.' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/votes/callback — Webhook NelsiusPay
router.post('/callback', async (req, res) => {
  const payload = req.body;
  console.log('📬 [CALLBACK] Reçu de NelsiusPay:', JSON.stringify(payload, null, 2));
  
  try {
    // On extrait les données soit de .data (format standard), soit du root
    const data = payload.data || payload;
    const event = payload.event || '';
    
    // On cherche la référence (ID du vote chez nous)
    const referenceId = data.reference_id || data.reference || (payload.metadata ? payload.metadata.voteId : null);
    
    // On cherche le code de transaction
    const transactionCode = data.transaction_code || data.charge_id || data.id || 'N/A';
    
    // On cherche le statut
    const status = (data.status || '').toLowerCase();

    console.log(`[CALLBACK] Event: ${event}, Ref: ${referenceId}, Status: ${status}`);

    if (!referenceId) {
      console.warn('⚠️ [CALLBACK] Impossible de trouver la référence du vote.');
      return res.status(200).json({ received: true, warning: 'No reference found' });
    }

    if (status === 'completed' || status === 'success' || event === 'payment.success') {
      console.log(`✅ [CALLBACK] SUCCESS détecté pour ${referenceId}.`);
      await confirmVote(referenceId, transactionCode);
    } else if (status === 'failed' || status === 'expired' || event === 'payment.failed') {
      console.log(`❌ [CALLBACK] FAILURE détecté pour ${referenceId}.`);
      await db.query('UPDATE votes SET payment_status = ? WHERE id = ?', ['FAILED', referenceId]);
    }
    
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ [CALLBACK] Erreur traitement:', err.message);
    return res.status(200).json({ error: 'Internal error handled' });
  }
});

// GET /api/votes/status/:id — Vérifier le statut d'un vote (Polling)
router.get('/status/:id', async (req, res) => {
  const voteId = req.params.id;
  try {
    const [[vote]] = await db.query('SELECT payment_status, transaction_id FROM votes WHERE id = ?', [voteId]);
    if (!vote) return res.status(404).json({ success: false, message: 'Vote introuvable' });

    if (vote.payment_status !== 'PENDING') {
      return res.json({ success: true, status: vote.payment_status });
    }

    if (vote.transaction_id && vote.transaction_id !== 'N/A') {
      console.log(`[POLLING] Vérification active pour le vote ${voteId}...`);
      const result = await paymentService.checkStatus(vote.transaction_id);
      
      // ⚠️ Correction : On regarde d'abord le statut du PAIEMENT dans data.payment_status
      const paymentStatus = (result.data && result.data.payment_status) 
                             ? result.data.payment_status.toLowerCase() 
                             : (result.status ? result.status.toLowerCase() : null);

      console.log(`[POLLING] Statut détecté : ${paymentStatus}`);

      if (paymentStatus === 'completed' || paymentStatus === 'success') {
        console.log(`✅ [POLLING] Paiement confirmé pour ${voteId}`);
        await confirmVote(voteId, vote.transaction_id);
        return res.json({ success: true, status: 'SUCCESS' });
      } else if (paymentStatus === 'failed' || paymentStatus === 'expired') {
        console.log(`❌ [POLLING] Paiement échoué pour ${voteId}`);
        await db.query('UPDATE votes SET payment_status = ? WHERE id = ?', ['FAILED', voteId]);
        return res.json({ success: true, status: 'FAILED' });
      }
    }

    return res.json({ success: true, status: vote.payment_status });
  } catch (err) {
    console.error('[POLLING] Erreur:', err.message);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ── Confirmer un vote : mettre à jour vote + compteur artiste
async function confirmVote(voteId, transactionId) {
  try {
    const [[vote]] = await db.query('SELECT id, artist_id, vote_count, payment_status FROM votes WHERE id = ?', [voteId]);
    
    if (!vote) {
      console.error(`❌ [CONFIRM] Vote ${voteId} introuvable dans la DB.`);
      return;
    }

    if (vote.payment_status === 'SUCCESS') {
      console.log(`ℹ️ [CONFIRM] Vote ${voteId} déjà marqué comme SUCCESS.`);
      return;
    }

    console.log(`[CONFIRM] Mise à jour du vote ${voteId} (Artiste: ${vote.artist_id}, Votes: ${vote.vote_count})`);

    // 1. Marquer le vote comme réussi
    await db.query(
      'UPDATE votes SET payment_status = ?, transaction_id = ? WHERE id = ?',
      ['SUCCESS', transactionId, voteId]
    );

    // 2. Incrémenter le compteur de l'artiste
    await db.query(
      'UPDATE artists SET vote_count = vote_count + ? WHERE id = ?',
      [vote.vote_count, vote.artist_id]
    );

    // 3. Notifier en temps réel via Socket.IO
    const [[updated]] = await db.query('SELECT vote_count FROM artists WHERE id = ?', [vote.artist_id]);
    if (updated && typeof global.emitVoteUpdate === 'function') {
      global.emitVoteUpdate(vote.artist_id, updated.vote_count);
    }

    if (typeof global.emitVoteSuccess === 'function') {
      global.emitVoteSuccess(voteId);
    }
    
    console.log(`✨ [CONFIRM] Vote ${voteId} validé avec succès !`);
  } catch (err) {
    console.error('❌ [CONFIRM] Erreur lors de la confirmation du vote:', err.message);
  }
}

function getIP(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

module.exports = router;
