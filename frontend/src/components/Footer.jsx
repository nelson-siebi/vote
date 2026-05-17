import React from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { settings } = useStore();

  return (
    <footer style={{
      backgroundColor: '#fff',
      color: 'var(--text-primary)',
      padding: '80px 5% 40px',
      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2rem', margin: 0,
          background: 'linear-gradient(90deg, var(--accent-color), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800
        }}>
          {settings?.logo_text || "BeatVote"}
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.8, fontSize: '1.05rem' }}>
          La plateforme numéro 1 pour propulser les talents de demain. Découvrez, écoutez et votez pour vos artistes préférés au Cameroun.
        </p>

        {(settings?.contact_phone || settings?.contact_email) && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {settings?.contact_phone && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={18} color="var(--accent-color)" /> {settings.contact_phone}</span>}
            {settings?.contact_email && <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={18} color="var(--accent-color)" /> {settings.contact_email}</span>}
          </div>
        )}

        {(settings?.facebook_url || settings?.instagram_url) && (
          <div style={{ display: 'flex', gap: '20px', marginTop: '-8px' }}>
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" style={socialStyle}>Facebook</a>
            )}
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" style={socialStyle}>Instagram</a>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
          <Link to="/" style={linkStyle}>Accueil</Link>
          <Link to="/classement" style={linkStyle}>Classement</Link>
          <Link to="/a-propos" style={linkStyle}>À propos</Link>
          <Link to="/contact" style={linkStyle}>Contact</Link>
        </div>
        <div style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, var(--accent-color), var(--accent-secondary))', borderRadius: '10px', marginTop: '8px', opacity: 0.3 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', opacity: 0.8 }}>
          &copy; {new Date().getFullYear()} {settings?.logo_text || "BeatVote"}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

const linkStyle = {
  color: '#64748b',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  transition: 'all 0.2s',
  padding: '4px 8px',
  borderRadius: '6px'
};

const socialStyle = {
  color: 'var(--accent-color)',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '0.95rem',
  padding: '8px 16px',
  borderRadius: '50px',
  background: 'rgba(255, 85, 0, 0.08)',
  transition: 'all 0.2s'
};
