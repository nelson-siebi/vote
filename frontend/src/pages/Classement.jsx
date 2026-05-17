import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { Trophy, Medal } from 'lucide-react';

export default function Classement() {
  const { artists, isLoading, fetchArtists } = useStore();

  useEffect(() => {
    if (artists.length === 0) fetchArtists();
  }, [artists.length, fetchArtists]);

  const sorted = [...artists].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  const medals = [
    <Trophy size={28} color="#ff5500" />, // Or / Accent (1er)
    <Medal size={28} color="#94a3b8" />, // Argent (2e)
    <Medal size={28} color="#b45309" />  // Bronze (3e)
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '120px', paddingBottom: '80px' }}>
      {/* Fond décoratif */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255, 85, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(15, 23, 42, 0.03) 0%, transparent 50%)',
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>
            Classement <span style={{ background: 'linear-gradient(135deg, #ff5500, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en direct</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '500px', margin: '0 auto', fontWeight: 500 }}>
            Les artistes les plus soutenus par la communauté camerounaise.
          </p>
        </motion.div>

        {isLoading && artists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 20px', borderColor: '#ff5500', borderTopColor: 'transparent' }}></div>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Chargement du classement...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sorted.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={`/artiste/${artist.slug || artist.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      padding: '20px 28px',
                      borderRadius: '24px',
                      background: '#fff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      border: i < 3 ? '1.5px solid rgba(255, 85, 0, 0.2)' : '1.5px solid #f1f5f9',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(255,85,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 85, 0, 0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = i < 3 ? 'rgba(255, 85, 0, 0.2)' : '#f1f5f9'; }}
                  >
                    {/* Rang */}
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0,
                      background: i < 3 ? 'rgba(255, 85, 0, 0.1)' : '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: i < 3 ? '1.5rem' : '1.1rem',
                      fontWeight: 800, color: i < 3 ? '#ff5500' : '#94a3b8',
                    }}>
                      {i < 3 ? medals[i] : i + 1}
                    </div>

                    {/* Photo */}
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0,
                      border: '2px solid #fff', boxShadow: '0 0 0 2px #f1f5f9'
                    }}>
                      <img
                        src={artist.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100'}
                        alt={artist.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#1e293b', marginBottom: '2px' }}>{artist.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{artist.genre} · {artist.city}</div>
                    </div>

                    {/* Votes */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '1.4rem', fontWeight: 800,
                        background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: 'Outfit, sans-serif',
                      }}>
                        {(artist.voteCount || 0).toLocaleString()}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>votes</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
