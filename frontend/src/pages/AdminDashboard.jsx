import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Banknote, Eye, Mic, BarChart3, TrendingUp, Save, CheckCircle2, AlertCircle, Trash2, Edit3, X } from 'lucide-react';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

function StatCard({ label, value, color, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        background: '#1e293b', borderRadius: '20px', padding: '24px',
        flex: '1 1 240px', border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', gap: '12px'
      }}
    >
      <div style={{ color: color || 'var(--accent-color)', background: `${color}15`, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{value}</div>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{label}</div>
      </div>
    </motion.div>
  );
}

function Toast({ message, type, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      style={{
        position: 'fixed', bottom: '30px', right: '30px', zIndex: 11000,
        background: type === 'success' ? '#10b981' : '#ef4444',
        color: '#fff', padding: '16px 24px', borderRadius: '16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', minWidth: '300px'
      }}
    >
      {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
      <div style={{ flex: 1, fontWeight: 600 }}>{message}</div>
      <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}><X size={20} /></button>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('adminToken'));
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [stats, setStats] = useState(null);
  const [artists, setArtists] = useState([]);
  const [settings, setSettings] = useState({});
  const [toast, setToast] = useState(null);
  
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'artists', 'settings'
  const [editingArtist, setEditingArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const statsRes = await fetch(`${API_BASE}/admin/stats`, { headers });
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.data);

      const artistsRes = await fetch(`${API_BASE}/admin/artists`, { headers });
      const artistsData = await artistsRes.json();
      if (artistsData.success) setArtists(artistsData.data);

      const settingsRes = await fetch(`${API_BASE}/admin/settings`, { headers });
      const settingsData = await settingsRes.json();
      if (settingsData.success) setSettings(settingsData.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setAuthenticated(true);
      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      setLoginError('Erreur de connexion au serveur.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthenticated(false);
    setToken(null);
  };

  const handleSaveArtist = async (e) => {
    e.preventDefault();
    const method = editingArtist.id ? 'PUT' : 'POST';
    const url = editingArtist.id ? `${API_BASE}/admin/artists/${editingArtist.id}` : `${API_BASE}/admin/artists`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingArtist)
      });
      if (res.ok) {
        setIsModalOpen(false);
        showToast(editingArtist.id ? "Artiste mis à jour" : "Artiste créé");
        fetchData();
      } else {
        showToast("Erreur lors de l'enregistrement", 'error');
      }
    } catch (err) {
      showToast("Erreur serveur", 'error');
    }
  };

  const handleDeleteArtist = async (id) => {
    if (!window.confirm("Supprimer cet artiste ?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/artists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Artiste supprimé");
        fetchData();
      } else {
        showToast("Erreur de suppression", 'error');
      }
    } catch (err) {
      showToast("Erreur serveur", 'error');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) showToast("Paramètres globaux mis à jour");
      else showToast("Erreur lors de l'enregistrement", 'error');
    } catch (err) {
      showToast("Erreur serveur", 'error');
    }
  };

  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin}
          style={{
            background: '#1e293b', padding: '48px 32px', borderRadius: '32px',
            width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(255,85,0,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Flame size={32} color="#ff5500" />
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Admin Access</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>Gérez la plateforme BeatVote237</p>
          </div>
          <label style={labelStyle}>Identifiant</label>
          <input
            type="text" placeholder="admin"
            value={loginForm.username}
            onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
            style={inputStyle}
          />
          <label style={labelStyle}>Mot de passe</label>
          <input
            type="password" placeholder="••••••••"
            value={loginForm.password}
            onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
            style={inputStyle}
          />
          {loginError && <p style={{ color: '#f87171', textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem', fontWeight: 600 }}>{loginError}</p>}
          <button type="submit" style={btnStyle}>Se connecter au Dashboard</button>
        </motion.form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: '30px 20px', fontFamily: 'Outfit, sans-serif' }}>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900 }}>Espace <span style={{color: 'var(--accent-color)'}}>Admin</span></h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={18} />}>Vue d'ensemble</TabButton>
              <TabButton active={activeTab === 'artists'} onClick={() => setActiveTab('artists')} icon={<Mic size={18} />}>Artistes</TabButton>
              <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Save size={18} />}>Paramètres</TabButton>
            </div>
          </div>
          <button onClick={handleLogout} style={{ ...btnStyle, width: 'auto', padding: '12px 24px', fontSize: '0.9rem', background: '#334155', border: '1px solid rgba(255,255,255,0.05)' }}>
            Déconnexion
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <StatCard icon={<Flame size={24} />} label="Votes cumulés" value={stats.totalVotes.toLocaleString()} color="#ff5500" />
              <StatCard icon={<Banknote size={24} />} label="Chiffre d'affaires" value={`${stats.totalRevenue.toLocaleString()} FCFA`} color="#10b981" />
              <StatCard icon={<Eye size={24} />} label="Vues uniques" value={stats.totalViews.toLocaleString()} color="#60a5fa" />
              <StatCard icon={<Mic size={24} />} label="Artistes en lice" value={stats.totalArtists} color="#8b5cf6" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
              <div>
                <SectionTitle><BarChart3 size={20} /> Classement Actuel</SectionTitle>
                <div style={cardStyle}>
                  {stats.topArtists.map((artist, i) => (
                    <div key={artist.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 0', borderBottom: i === stats.topArtists.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
                       <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: i < 3 ? 'rgba(255,85,0,0.1)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: i < 3 ? '#ff5500' : '#64748b', fontSize: '0.9rem' }}>{i+1}</span>
                       <div style={{ flex: 1, fontWeight: 700, fontSize: '1.05rem' }}>{artist.name}</div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#ff5500', fontWeight: 900, fontSize: '1.1rem' }}>{artist.voteCount}</div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>VOTES</div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <SectionTitle><TrendingUp size={20} /> Activité Récente</SectionTitle>
                <div style={cardStyle}>
                   {stats.recentVotes.map((v, i) => (
                     <div key={i} style={{ fontSize: '0.9rem', padding: '14px 0', borderBottom: i === stats.recentVotes.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginTop: '6px' }} />
                        <div>
                          <span style={{color: '#f8fafc', fontWeight: 700}}>{v.voter_name}</span> a voté <span style={{fontWeight: 800, color: '#ff5500'}}>{v.vote_count} fois</span> pour <span style={{fontWeight: 700}}>{v.artistName}</span>
                          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px', fontWeight: 500 }}>
                            {v.amount_fcfa} FCFA • {v.payment_method.toUpperCase()} • {new Date(v.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'artists' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
              <SectionTitle>Gestion du Casting</SectionTitle>
              <button 
                onClick={() => { setEditingArtist({ name: '', genre: '', city: '', bio: '', image_url: '' }); setIsModalOpen(true); }}
                style={{ ...btnStyle, width: 'auto', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Mic size={18} /> Ajouter un nouvel artiste
              </button>
            </div>
            <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '20px' }}>Artiste</th>
                      <th>Style / Genre</th>
                      <th>Ville</th>
                      <th>Stats</th>
                      <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artists.map(a => (
                      <tr key={a.id} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '20px', fontWeight: 700, fontSize: '1.05rem' }}>{a.name}</td>
                        <td style={{ color: '#94a3b8', fontWeight: 500 }}>{a.genre}</td>
                        <td style={{ color: '#94a3b8', fontWeight: 500 }}>{a.city}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ color: '#ff5500', fontWeight: 700 }}><Flame size={14} style={{ marginRight: '4px' }} />{a.voteCount}</div>
                            <div style={{ color: '#60a5fa', fontWeight: 700 }}><Eye size={14} style={{ marginRight: '4px' }} />{a.views}</div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <button onClick={() => { setEditingArtist(a); setIsModalOpen(true); }} style={{ ...actionBtn, color: '#f8fafc', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteArtist(a.id)} style={{ ...actionBtn, color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '8px 12px', borderRadius: '8px' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: '32px' }}>
            {/* Infos Principales */}
            <div style={cardStyle}>
              <SectionTitle><CheckCircle2 size={20} /> Identité de la Marque</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={labelStyle}>Nom de l'évènement</label>
                  <input style={inputStyle} value={settings.logo_text || ''} onChange={e => setSettings({...settings, logo_text: e.target.value})} placeholder="Ex: BeatVote 237" />
                </div>
                <div>
                  <label style={labelStyle}>Logo Image (Lien direct)</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input style={inputStyle} value={settings.logo_image || ''} onChange={e => setSettings({...settings, logo_image: e.target.value})} placeholder="https://lien-vers-mon-logo.png" />
                    {settings.logo_image && (
                      <img src={settings.logo_image} alt="Preview" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    )}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>URL du Frontend (CORS autorisé)</label>
                  <input style={inputStyle} value={settings.frontend_url || ''} onChange={e => setSettings({...settings, frontend_url: e.target.value})} placeholder="http://localhost:5173" />
                </div>
                <div>
                  <label style={labelStyle}>URL du Backend (Callbacks/API)</label>
                  <input style={inputStyle} value={settings.backend_url || ''} onChange={e => setSettings({...settings, backend_url: e.target.value})} placeholder="http://localhost:5000" />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp / Service Client</label>
                  <input style={inputStyle} value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} placeholder="+237 6XX XXX XXX" />
                </div>
                <div>
                  <label style={labelStyle}>Email Support</label>
                  <input style={inputStyle} value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} placeholder="contact@beatvote.com" />
                </div>
                <div>
                  <label style={labelStyle}>Page Facebook</label>
                  <input style={inputStyle} value={settings.facebook_url || ''} onChange={e => setSettings({...settings, facebook_url: e.target.value})} placeholder="https://facebook.com/..." />
                </div>
                <div>
                  <label style={labelStyle}>Compte Instagram</label>
                  <input style={inputStyle} value={settings.instagram_url || ''} onChange={e => setSettings({...settings, instagram_url: e.target.value})} placeholder="https://instagram.com/..." />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
              {/* Annonce globale */}
              <div style={cardStyle}>
                <SectionTitle><MegaphoneIcon size={20} /> Bandeau d'Annonce</SectionTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: 'rgba(255,85,0,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,85,0,0.1)' }}>
                  <input type="checkbox" checked={settings.announcement_active || false} onChange={e => setSettings({...settings, announcement_active: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <label style={{ color: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>Activer le bandeau défilant</label>
                </div>
                <label style={labelStyle}>Message de l'annonce</label>
                <input style={inputStyle} value={settings.announcement_text || ''} onChange={e => setSettings({...settings, announcement_text: e.target.value})} placeholder="Ex: Clôture des votes le 30 Juin à minuit !" />
              </div>

              {/* Popup Global */}
              <div style={cardStyle}>
                <SectionTitle><Eye size={20} /> Popup de Bienvenue</SectionTitle>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: 'rgba(96,165,250,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(96,165,250,0.1)' }}>
                  <input type="checkbox" checked={settings.popup_active || false} onChange={e => setSettings({...settings, popup_active: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <label style={{ color: '#f8fafc', fontWeight: 700, cursor: 'pointer' }}>Activer le popup d'accueil</label>
                </div>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Titre du Popup</label>
                    <input style={inputStyle} value={settings.popup_title || ''} onChange={e => setSettings({...settings, popup_title: e.target.value})} placeholder="Bienvenue !" />
                  </div>
                  <div>
                    <label style={labelStyle}>Image Promotionnelle (URL)</label>
                    <input style={inputStyle} value={settings.popup_image || ''} onChange={e => setSettings({...settings, popup_image: e.target.value})} placeholder="URL de l'image" />
                  </div>
                  <div>
                    <label style={labelStyle}>Lien du Bouton Action</label>
                    <input style={inputStyle} value={settings.popup_link || ''} onChange={e => setSettings({...settings, popup_link: e.target.value})} placeholder="/classement" />
                  </div>
                  <div>
                    <label style={labelStyle}>Texte descriptif</label>
                    <textarea style={{...inputStyle, height: '80px'}} value={settings.popup_content || ''} onChange={e => setSettings({...settings, popup_content: e.target.value})} placeholder="Écrivez votre message ici..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres Paiement */}
            <div style={cardStyle}>
              <SectionTitle><Banknote size={20} /> Configuration Paiement (NelsiusPay)</SectionTitle>
              <div style={{ background: 'rgba(16,185,129,0.05)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.1)', marginBottom: '20px' }}>
                <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                  ⚠️ Ces réglages sont critiques. Assurez-vous d'utiliser une clé valide pour recevoir les paiements réels.
                </p>
              </div>
              <label style={labelStyle}>NelsiusPay API Secret Key (SK_...)</label>
              <input 
                type="password"
                style={inputStyle} 
                value={settings.nelsius_api_key || ''} 
                onChange={e => setSettings({...settings, nelsius_api_key: e.target.value})} 
                placeholder="sk_live_..." 
              />
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '10px' }}>
                Si ce champ est vide, la clé par défaut du fichier .env sera utilisée.
              </p>
            </div>

            <button onClick={handleSaveSettings} style={{ ...btnStyle, padding: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Save size={24} /> Appliquer les modifications globales
            </button>
          </motion.div>
        )}

      </div>

      {/* Modal Artiste */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={modalOverlay}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={modalContent}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingArtist.id ? 'Éditer le profil' : 'Nouveau Profil'}</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSaveArtist} style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Nom de scène</label>
                  <input style={inputStyle} placeholder="Ex: Junior Mbappé" value={editingArtist.name} onChange={e => setEditingArtist({...editingArtist, name: e.target.value})} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Genre musical</label>
                    <input style={inputStyle} placeholder="Ex: Makossa / Afrobeat" value={editingArtist.genre} onChange={e => setEditingArtist({...editingArtist, genre: e.target.value})} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Ville d'origine</label>
                    <input style={inputStyle} placeholder="Ex: Douala" value={editingArtist.city} onChange={e => setEditingArtist({...editingArtist, city: e.target.value})} required />
                  </div>
                </div>
                
                <div>
                  <label style={labelStyle}>Photo de profil (Lien URL)</label>
                  <input style={inputStyle} placeholder="https://..." value={editingArtist.image_url} onChange={e => setEditingArtist({...editingArtist, image_url: e.target.value})} required />
                </div>
                
                <div>
                  <label style={labelStyle}>Bio / Présentation</label>
                  <textarea style={{ ...inputStyle, height: '120px' }} placeholder="Racontez l'histoire de l'artiste..." value={editingArtist.bio} onChange={e => setEditingArtist({...editingArtist, bio: e.target.value})} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="submit" style={btnStyle}>Confirmer l'enregistrement</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, background: '#334155', boxShadow: 'none' }}>Annuler</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>{children}</h2>;
}

function TabButton({ children, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(255, 85, 0, 0.1)' : 'transparent',
      border: active ? '1px solid rgba(255, 85, 0, 0.2)' : '1px solid transparent',
      color: active ? '#ff5500' : '#94a3b8',
      padding: '10px 18px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
    }}>
      {icon}
      {children}
    </button>
  );
}

function MegaphoneIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 13v-2Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
    </svg>
  );
}

const cardStyle = {
  background: '#1e293b', borderRadius: '24px', padding: '24px',
  border: '1px solid rgba(255,255,255,0.05)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
};

const inputStyle = {
  width: '100%', padding: '14px 18px', marginBottom: '0',
  backgroundColor: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none',
  transition: 'all 0.2s',
  fontFamily: 'Inter, sans-serif'
};

const labelStyle = { display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '16px' };

const btnStyle = {
  width: '100%', padding: '14px', background: 'linear-gradient(135deg, #ff5500, #ff8c00)',
  border: 'none', color: '#fff', borderRadius: '16px', fontWeight: 800,
  fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255, 85, 0, 0.25)',
  transition: 'all 0.3s'
};

const actionBtn = { background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' };

const modalOverlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
  padding: '20px'
};

const modalContent = {
  background: '#1e293b', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '550px',
  border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
  maxHeight: '90vh', overflowY: 'auto'
};


