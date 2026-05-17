import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function GlobalPopup() {
  const { settings } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si le popup est actif et n'a pas été fermé par l'utilisateur
    if (settings && settings.popup_active) {
      const isDismissed = localStorage.getItem('global_popup_dismissed');
      if (!isDismissed) {
        // Petit délai pour ne pas agresser l'utilisateur dès la première seconde
        const timer = setTimeout(() => setIsVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [settings]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('global_popup_dismissed', 'true');
  };

  const handleAction = () => {
    handleClose();
    if (settings.popup_link) {
      window.location.href = settings.popup_link;
    }
  };

  if (!settings || !settings.popup_active) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Overlay sombre */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(4px)' }} 
          />
          
          {/* Boîte Popup */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ 
              position: 'relative', 
              background: 'var(--bg-surface)', 
              width: '100%', 
              maxWidth: '500px', 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              border: '1px solid var(--border-light)'
            }}
          >
            {/* Bouton Fermer (X) */}
            <button 
              onClick={handleClose}
              style={{
                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold'
              }}
            >
              ×
            </button>

            {/* Image (Optionnelle) */}
            {settings.popup_image && (
              <img 
                src={settings.popup_image} 
                alt="Annonce" 
                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} 
              />
            )}

            {/* Contenu textuel */}
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              {settings.popup_title && (
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 900 }}>
                  {settings.popup_title}
                </h2>
              )}
              
              {settings.popup_content && (
                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
                  {settings.popup_content}
                </p>
              )}

              {/* Boutons d'action */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={handleClose}
                  style={{
                    padding: '12px 24px', background: 'transparent', border: '2px solid var(--border-light)',
                    color: 'var(--text-primary)', borderRadius: '50px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Fermer
                </button>
                {settings.popup_link && (
                  <button 
                    onClick={handleAction}
                    style={{
                      padding: '12px 24px', background: 'var(--accent-color)', border: 'none',
                      color: 'white', borderRadius: '50px', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 8px 16px rgba(255, 85, 0, 0.3)'
                    }}
                  >
                    Découvrir ➔
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
