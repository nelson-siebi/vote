const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/settings - Fetch global site settings
router.get('/', async (req, res) => {
  try {
    const [[settings]] = await db.query('SELECT * FROM site_settings WHERE id = 1');
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
