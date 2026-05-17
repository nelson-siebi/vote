import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArtistCard from './ArtistCard';
import useStore from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function VotingArena() {
  const navigate = useNavigate();
  const { artists, isLoading, error, fetchArtists } = useStore();

  useEffect(() => {
    if (artists.length === 0) {
      fetchArtists();
    }
  }, [artists.length, fetchArtists]);

  // Redirection vers la page de vote
  const handleVoteClick = (id) => {
    navigate(`/vote/${id}`);
  };

  // Redirection vers la fiche artiste
  const handleCardClick = (id) => {
    navigate(`/artiste/${id}`);
  };

  if (isLoading && artists.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="canvas-loader">
          <div className="spinner"></div>
          <p>Chargement des talents...</p>
        </div>
      </div>
    );
  }

  if (error && artists.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <p style={{ color: '#f87171' }}>{error}</p>
        <button 
          onClick={fetchArtists}
          className="cta-button"
          style={{ marginTop: '20px', padding: '12px 30px', fontSize: '0.95rem' }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="voting-arena" style={{ padding: '80px 5%', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '50px' }}
      >
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '15px' }}>
          L'Arène de Vote
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Découvrez les talents, consultez leur profil et votez pour propulser votre artiste favori au sommet.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}
      >
        {artists.map(artist => (
          <motion.div
            key={artist.id}
            variants={itemVariants}
            style={{ flex: '1 1 300px', maxWidth: '320px', display: 'flex', justifyContent: 'center' }}
          >
            <ArtistCard
              artist={artist}
              onVote={handleVoteClick}
              onCardClick={handleCardClick}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
