import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styles from './ArtistCard.module.css';

export default function ArtistCard({ artist, onVote, onCardClick }) {
  const cardRef = useRef(null);

  // Valeurs pour l'effet Tilt 3D (Framer Motion)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Ajout de fluidité au mouvement de la souris (Spring)
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  // Translation du mouvement en rotation 3D
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calcul de la position de la souris par rapport au centre de la carte
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Remise à zéro quand la souris quitte la carte
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onCardClick && onCardClick(artist.slug || artist.id)}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        cursor: 'pointer',
      }}
      className={styles.cardWrapper}
    >
      <div className={styles.cardContent} style={{ transform: "translateZ(30px)" }}>
        <div className={styles.imageContainer}>
          <img 
            src={artist.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop'} 
            alt={artist.name} 
            className={styles.artistImage} 
            loading="lazy"
          />
        </div>
        
        {/* Le gradient assombrit le bas pour bien voir le texte, même sur fond clair */}
        <div className={styles.overlay}>
          <h3 className={styles.artistName}>{artist.name}</h3>
          <p className={styles.artistGenre}>{artist.genre} • {artist.city}</p>
          
          {/* Les boutons "ressortent" en 3D par rapport à l'image */}
          <div className={styles.voteSection}>
            <span className={styles.voteCount}>🔥 {artist.voteCount} Votes</span>
            <button 
              className={styles.voteBtn} 
              onClick={(e) => { e.stopPropagation(); onVote(artist.slug || artist.id); }}
            >
              Voter
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
