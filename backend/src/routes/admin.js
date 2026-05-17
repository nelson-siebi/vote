const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'beatvote237_secret';

// Middleware d'authentification
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Non autorisé.' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide.' });
  }
}

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [[admin]] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (!admin) return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, username: admin.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/admin/stats — KPIs globaux
router.get('/stats', auth, async (req, res) => {
  try {
    const [[{ totalVotes }]]  = await db.query(`SELECT COALESCE(SUM(vote_count), 0) AS totalVotes FROM votes WHERE payment_status = 'SUCCESS'`);
    const [[{ totalRevenue }]]= await db.query(`SELECT COALESCE(SUM(amount_fcfa), 0) AS totalRevenue FROM votes WHERE payment_status = 'SUCCESS'`);
    const [[{ totalViews }]]  = await db.query(`SELECT COUNT(*) AS totalViews FROM page_views`);
    const [[{ totalArtists }]]= await db.query(`SELECT COUNT(*) AS totalArtists FROM artists WHERE is_active = 1`);

    // Votes par jour (7 derniers jours)
    const [votesByDay] = await db.query(`
      SELECT DATE(created_at) AS date, SUM(vote_count) AS votes
      FROM votes WHERE payment_status = 'SUCCESS' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at) ORDER BY date ASC`);

    // Sources de trafic
    const [trafficSources] = await db.query(`
      SELECT source, COUNT(*) AS count
      FROM page_views GROUP BY source ORDER BY count DESC`);

    // Top artistes
    const [topArtists] = await db.query(`
      SELECT id, name, genre, vote_count AS voteCount, view_count AS views
      FROM artists WHERE is_active = 1 ORDER BY vote_count DESC LIMIT 10`);

    // Derniers votes
    const [recentVotes] = await db.query(`
      SELECT v.voter_name, v.vote_count, v.amount_fcfa, v.payment_method, a.name AS artistName, v.created_at
      FROM votes v JOIN artists a ON v.artist_id = a.id
      WHERE v.payment_status = 'SUCCESS' ORDER BY v.created_at DESC LIMIT 20`);

    res.json({
      success: true,
      data: { totalVotes, totalRevenue, totalViews, totalArtists, votesByDay, trafficSources, topArtists, recentVotes }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/admin/artists — liste gestion artistes
router.get('/artists', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, genre, city, bio, image_url, vote_count AS voteCount, view_count AS views, is_active, created_at FROM artists ORDER BY vote_count DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/admin/artists — ajouter un artiste
router.post('/artists', auth, async (req, res) => {
  const { name, genre, city, bio, image_url } = req.body;
  try {
    const id = require('uuid').v4();
    await db.query(
      'INSERT INTO artists (id, name, genre, city, bio, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, genre, city, bio, image_url]
    );
    res.json({ success: true, message: 'Artiste ajouté avec succès.', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'ajout.' });
  }
});

// PUT /api/admin/artists/:id — modifier un artiste
router.put('/artists/:id', auth, async (req, res) => {
  const { name, genre, city, bio, image_url, is_active } = req.body;
  try {
    await db.query(
      'UPDATE artists SET name=?, genre=?, city=?, bio=?, image_url=?, is_active=? WHERE id=?',
      [name, genre, city, bio, image_url, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Artiste mis à jour.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/artists/:id — supprimer un artiste
router.delete('/artists/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM artists WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Artiste supprimé.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/admin/settings — voir les paramètres
router.get('/settings', auth, async (req, res) => {
  try {
    const [[settings]] = await db.query('SELECT * FROM site_settings WHERE id = 1');
    res.json({ success: true, data: settings || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/admin/settings — modifier les paramètres
router.put('/settings', auth, async (req, res) => {
  const {
    logo_text, logo_image, contact_phone, contact_email, facebook_url, instagram_url,
    announcement_text, announcement_active,
    popup_title, popup_content, popup_image, popup_link, popup_active,
    nelsius_api_key, backend_url, frontend_url
  } = req.body;
  
  try {
    await db.query(
      `UPDATE site_settings SET 
        logo_text = ?, logo_image = ?, contact_phone = ?, contact_email = ?, facebook_url = ?, instagram_url = ?,
        announcement_text = ?, announcement_active = ?,
        popup_title = ?, popup_content = ?, popup_image = ?, popup_link = ?, popup_active = ?,
        nelsius_api_key = ?, backend_url = ?, frontend_url = ?
       WHERE id = 1`,
      [
        logo_text || '', logo_image || '', contact_phone || '', contact_email || '', facebook_url || '', instagram_url || '',
        announcement_text || '', announcement_active ? 1 : 0,
        popup_title || '', popup_content || '', popup_image || '', popup_link || '', popup_active ? 1 : 0,
        nelsius_api_key || '', backend_url || '', frontend_url || ''
      ]
    );
    res.json({ success: true, message: 'Paramètres mis à jour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
