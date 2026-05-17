import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import useStore from '../store/useStore';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { settings } = useStore();

  const navLinks = [
    { label: 'Accueil', to: '/' },
    { label: 'Classement', to: '/classement' },
    { label: 'À Propos', to: '/a-propos' },
    { label: 'Contact', to: '/contact' },
  ];

  const menuVariants = {
    hidden: { opacity: 0, y: -20, scaleY: 0.8, transformOrigin: "top" },
    visible: { 
      opacity: 1, 
      y: 0, 
      scaleY: 1,
      transition: { type: 'spring', stiffness: 120, damping: 15, staggerChildren: 0.08 } 
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const closeMobile = () => setIsOpen(false);

  return (
    <>
      {/* Announcement Bar */}
      {settings?.announcement_active && settings?.announcement_text && (
        <div style={{
          background: 'var(--text-primary)', color: 'white', padding: '8px 5%',
          fontSize: '0.9rem', fontWeight: 600, textAlign: 'center',
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 102,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
          <Megaphone size={16} color="var(--accent-color)" />
          <marquee scrollamount="5" style={{ maxWidth: '800px' }}>
            {settings.announcement_text}
          </marquee>
        </div>
      )}

      {/* Main Navbar */}
      <nav className={styles.navbar} style={{ top: (settings?.announcement_active && settings?.announcement_text) ? '34px' : '0' }}>
        <Link to="/" className={styles.logo} onClick={closeMobile}>
          {settings?.logo_image ? (
            <img src={settings.logo_image} alt="Logo" style={{ height: '40px', width: 'auto', display: 'block' }} />
          ) : settings?.logo_text ? (
            <>
              {settings.logo_text.slice(0, Math.ceil(settings.logo_text.length / 2))}
              <span>{settings.logo_text.slice(Math.ceil(settings.logo_text.length / 2))}</span>
            </>
          ) : (
            <>Beat<span>Vote</span></>
          )}
        </Link>
      
        {/* Desktop Links */}
        <div className={styles.desktopLinks}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navItem} ${location.pathname === link.to ? styles.navItemActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger Button */}
        <div className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
          <motion.div animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className={styles.hamburgerLine} />
          <motion.div animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className={styles.hamburgerLine} />
          <motion.div animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className={styles.hamburgerLine} />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className={styles.mobileMenu}
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ top: (settings?.announcement_active && settings?.announcement_text) ? '114px' : '80px' }}
            >
              {navLinks.map(link => (
                <motion.div key={link.to} variants={itemVariants}>
                  <Link
                    to={link.to}
                    className={styles.mobileNavItem}
                    onClick={closeMobile}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
