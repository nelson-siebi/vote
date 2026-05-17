import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulation d'un chargement asynchrone (temps réel)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 800); // Laisse l'animation finir avant de démonter
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 2;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className={styles.loaderContainer}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className={styles.loaderContent}>
        {/* Animated 3D Equalizer */}
        <div className={styles.equalizer}>
          {[1, 2, 3, 4, 5].map((bar) => (
            <motion.div
              key={bar}
              className={styles.bar}
              animate={{ 
                height: ["20%", "100%", "30%", "80%", "20%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: bar * 0.1,
              }}
            />
          ))}
        </div>
        
        <h1 className={styles.title}>
          <motion.span
             animate={{ textShadow: ["0px 0px 10px rgba(236,72,153,0.5)", "0px 0px 20px rgba(91,33,182,0.8)", "0px 0px 10px rgba(236,72,153,0.5)"] }}
             transition={{ duration: 2, repeat: Infinity }}
          >
            BeatVote
          </motion.span>
        </h1>
        
        <motion.p 
          className={styles.loadingText}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Initialisation de l'univers musical...
        </motion.p>
        
        <div className={styles.progressWrapper}>
          <div className={styles.progressText}>{progress}%</div>
          <div className={styles.progressBarContainer}>
            <motion.div 
              className={styles.progressBar} 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
