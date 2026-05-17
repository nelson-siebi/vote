import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Eye } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ArtistDetails() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/artists/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setArtist(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="canvas-loader">
          <div className="spinner"></div>
          <p>Chargement du talent...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#0f172a' }}>Artiste introuvable</h2>
        <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Fond décoratif */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at 10% 10%, rgba(255, 85, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 90%, rgba(15, 23, 42, 0.03) 0%, transparent 50%)',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '40px' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Retour aux artistes
          </Link>
        </motion.div>

        {/* Carte hero artiste */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            background: '#fff',
            borderRadius: '40px',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.06)',
            marginBottom: '48px',
            border: '1px solid rgba(0,0,0,0.03)'
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', minHeight: '500px' }}>
            <img src={artist.imageUrl} alt={artist.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6), transparent)',
            }} />
            <div style={{
              position: 'absolute', top: '32px', left: '32px',
              background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
              padding: '10px 24px', borderRadius: '30px', fontSize: '0.85rem',
              fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '2px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              {artist.genre}
            </div>
          </div>

          {/* Infos */}
          <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ color: 'var(--accent-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.85rem', marginBottom: '16px' }}>
              Profil Artiste Certifié
            </motion.p>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1 }}>
              {artist.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 40px', fontSize: '1.2rem', fontWeight: 500 }}>
              {artist.city} · Cameroun
            </p>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <StatCard value={(artist.voteCount || 0).toLocaleString()} label="Votes Reçus" icon={<Flame size={24} color="#ff5500" />} accent="var(--accent-secondary)" />
              <StatCard value={(artist.views || 0).toLocaleString()} label="Vues Profil" icon={<Eye size={24} color="#0f172a" />} accent="var(--accent-color)" />
            </div>

            {/* Biographie */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '16px', fontWeight: 700 }}>À propos</h3>
              <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem' }}>
                {artist.bio || "Aucune biographie disponible pour le moment."}
              </p>
            </div>

            {/* CTA vote */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link
                to={`/vote/${artist.slug || artist.id}`}
                className="cta-button"
                style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Voter maintenant
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, accent }) {
  return (
    <div style={{
      padding: '24px', background: '#f8fafc',
      borderRadius: '24px', border: '1px solid #f1f5f9', textAlign: 'left',
    }}>
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px', fontWeight: 600 }}>{label}</div>
      <div style={{ width: '40px', height: '4px', background: accent, marginTop: '12px', borderRadius: '10px', opacity: 0.6 }} />
    </div>
  );
}
