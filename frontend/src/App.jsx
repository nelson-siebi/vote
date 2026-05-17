import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';
import LoadingScreen from './components/LoadingScreen';
import NetworkStatus from './components/NetworkStatus';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArtistDetails from './pages/ArtistDetails';
import VotePage from './pages/VotePage';
import Classement from './pages/Classement';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import useStore from './store/useStore';
import GlobalPopup from './components/GlobalPopup';
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const { fetchArtists, fetchSettings } = useStore();

  useEffect(() => {
    fetchArtists();
    fetchSettings();
  }, [fetchArtists, fetchSettings]);

  // Écoute globale des succès de paiement via Webhook
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    
    socket.on('vote_success', (data) => {
      const myVotes = JSON.parse(localStorage.getItem('my_pending_votes') || '[]');
      if (myVotes.includes(data.voteId)) {
        setToast("✅ Votre vote a été validé avec succès ! Le classement est à jour.");
        setTimeout(() => setToast(null), 8000);
        
        // Optionnel : Retirer des votes en attente
        const newPending = myVotes.filter(id => id !== data.voteId);
        localStorage.setItem('my_pending_votes', JSON.stringify(newPending));
        
        // Mettre à jour la liste des artistes pour afficher le nouveau score global
        fetchArtists();
      }
    });

    return () => socket.disconnect();
  }, [fetchArtists]);

  return (
    <BrowserRouter>
      <NetworkStatus />

      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={{
              position: 'fixed', top: '40px', left: '50%', zIndex: 9999,
              background: '#dcfce7', color: '#166534', padding: '16px 24px',
              borderRadius: '16px', fontWeight: 700, fontSize: '1.05rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #bbf7d0'
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <div className="app-container">
          <Routes>
            {/* Route admin sans Navbar ni Footer */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Routes publiques avec Navbar + Footer */}
            <Route path="/*" element={
              <>
                <GlobalPopup />
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/artiste/:id" element={<ArtistDetails />} />
                    <Route path="/vote/:id" element={<VotePage />} />
                    <Route path="/classement" element={<Classement />} />
                    <Route path="/a-propos" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
