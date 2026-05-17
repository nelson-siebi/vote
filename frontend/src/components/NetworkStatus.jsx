import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStable, setShowStable] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStable(true);
      setTimeout(() => setShowStable(false), 3000); // Masquer après 3s
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          style={styles.offlineBanner}
        >
          ⚠️ Votre réseau est instable. Reconnexion en cours...
        </motion.div>
      )}

      {isOnline && showStable && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          style={styles.onlineBanner}
        >
          ✅ Le réseau est de nouveau stable.
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  offlineBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '12px',
    backgroundColor: '#ff4b4b',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    zIndex: 9999,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  onlineBanner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '12px',
    backgroundColor: '#00d26a',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    zIndex: 9999,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
};
