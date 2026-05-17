const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/artists — tous les artistes actifs
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, slug, name, genre, city, bio, image_url AS imageUrl,
              audio_url AS audioUrl, vote_count AS voteCount, view_count AS views
       FROM artists WHERE is_active = 1 ORDER BY vote_count DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/artists/:idOrSlug — détail d'un artiste + suivi de vue
router.get('/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  try {
    const [[artist]] = await db.query(
      `SELECT id, slug, name, genre, city, bio, image_url AS imageUrl,
              audio_url AS audioUrl, vote_count AS voteCount, view_count AS views
       FROM artists WHERE (id = ? OR slug = ?) AND is_active = 1`,
      [idOrSlug, idOrSlug]
    );

    if (!artist) return res.status(404).json({ success: false, message: 'Artiste introuvable.' });

    // Incrémenter le compteur de vues (en utilisant l'id réel)
    await db.query('UPDATE artists SET view_count = view_count + 1 WHERE id = ?', [artist.id]);

    // Enregistrer la vue dans page_views pour les stats admin
    const source = detectSource(req.headers.referer || '');
    await db.query(
      `INSERT INTO page_views (artist_id, source, referrer, user_agent, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [artist.id, source, req.headers.referer || null, req.headers['user-agent'] || null, getIP(req)]
    );

    // Récupérer les 5 derniers votes pour l'affichage
    const [recentVotes] = await db.query(
      `SELECT voter_name, vote_count, created_at FROM votes
       WHERE artist_id = ? AND payment_status = 'SUCCESS'
       ORDER BY created_at DESC LIMIT 5`,
      [artist.id]
    );

    res.json({ success: true, data: { ...artist, recentVotes } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

function detectSource(referer) {
  if (!referer) return 'direct';
  if (referer.includes('google'))    return 'google';
  if (referer.includes('facebook'))  return 'facebook';
  if (referer.includes('whatsapp'))  return 'whatsapp';
  if (referer.includes('telegram'))  return 'telegram';
  if (referer.includes('twitter'))   return 'twitter';
  return 'other';
}

function getIP(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

module.exports = router;
