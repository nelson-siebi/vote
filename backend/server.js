const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

// Export io pour l'utiliser dans les routes si besoin
app.set('io', io);

const db = require('./src/db');
app.use(cors({ 
  origin: async (origin, callback) => {
    try {
      const [[settings]] = await db.query('SELECT frontend_url FROM site_settings WHERE id = 1');
      const allowed = settings?.frontend_url || process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // Si l'origine de la requête correspond à l'URL autorisée ou si c'est localhost/test
      if (!origin || origin === allowed || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Non autorisé par CORS'));
      }
    } catch (err) {
      callback(null, true); // Fallback en cas d'erreur DB
    }
  }
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/artists', require('./src/routes/artists'));
app.use('/api/votes',   require('./src/routes/votes'));
app.use('/api/admin',   require('./src/routes/admin'));
app.use('/api/settings',require('./src/routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'BeatVote237 API', time: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée.' });
});

// ── Socket.io — Live vote updates ────────────────────────────
io.on('connection', (socket) => {
  console.log('🔗 Connecté:', socket.id);
  socket.on('disconnect', () => console.log('❌ Déconnecté:', socket.id));
});

// Exporter une fonction pour émettre un vote depuis les routes
global.emitVoteUpdate = (artistId, newCount) => {
  io.emit('vote_updated', { artistId, newCount });
};

global.emitVoteSuccess = (voteId) => {
  io.emit('vote_success', { voteId, message: "Votre vote a été validé avec succès !" });
};

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 API BeatVote237 → http://localhost:${PORT}`);
  console.log(`📊 Dashboard Admin   → http://localhost:${PORT}/api/admin`);
});
