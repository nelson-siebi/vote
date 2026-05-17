import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Music, Flame } from 'lucide-react';
import useStore from '../store/useStore';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api`;

function Stepper({ step }) {
  const steps = ['Votre vote', 'Paiement', 'Confirmation'];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '36px' }}>
      {steps.map((label, i) => {
        const active = i + 1 === step;
        const done   = i + 1 < step;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: done ? '#10b981' : active ? 'var(--accent-color)' : '#f1f5f9',
                color: done || active ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem',
                boxShadow: active ? '0 4px 12px rgba(255, 85, 0, 0.2)' : 'none',
                transition: 'all 0.3s',
                border: active ? 'none' : '1px solid #e2e8f0'
              }}>{done ? <Check size={18} strokeWidth={3} /> : i + 1}</div>
              <span style={{ fontSize: '0.75rem', fontWeight: active ? 700 : 500, color: active ? 'var(--accent-color)' : '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: '2px', background: done ? '#10b981' : '#f1f5f9', margin: '18px 6px 0', transition: 'background 0.4s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '6px 0 0', fontWeight: 500 }}>{error}</p>}
    </div>
  );
}

function Chip({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', backdropFilter: 'blur(10px)' }}>
      {icon}
      <span>{value}</span>
    </div>
  );
}

// ─── Styles constants ─────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '12px', fontSize: '0.95rem',
  fontFamily: 'Inter, sans-serif', color: '#0f172a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'all 0.2s',
};

const primaryBtn = {
  width: '100%', padding: '16px',
  background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
  border: 'none', borderRadius: '14px', color: '#fff',
  fontSize: '1rem', fontWeight: 700,
  fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(255, 85, 0, 0.2)',
  transition: 'all 0.3s',
};

// ─── Page principale ──────────────────────────────────────────────────
export default function VotePage() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', voteCount: 1 });
  const [payment, setPayment] = useState({ method: 'mtn', phone: '' });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/artists/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setArtist(data.data);
        setLoading(false);
      });
  }, [id]);

  // Polling pour vérifier le statut du paiement quand on est à l'étape 3
  useEffect(() => {
    let intervalId;
    if (step === 3 && result && result.voteId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/votes/status/${result.voteId}`);
          const data = await res.json();
          if (data.success) {
            if (data.status === 'SUCCESS') {
              setStep(4);
              clearInterval(intervalId);
            } else if (data.status === 'FAILED') {
              setErrors({ global: "Le paiement a échoué ou a été annulé." });
              setStep(2);
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error("Erreur polling status:", error);
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [step, result]);

  if (loading) return <div style={{ paddingTop: '120px', textAlign: 'center', color: 'var(--accent-color)' }}><div className="spinner" style={{ margin: '0 auto 20px' }}></div>Chargement...</div>;

  if (!artist) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Artiste introuvable</h2>
        <Link to="/" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>← Retour</Link>
      </div>
    );
  }

  const total = form.voteCount * 100;

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nom requis";
    if (!form.email.includes('@')) e.email = "Email invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!payment.phone.match(/^[0-9]{8,12}$/)) e.phone = "Numéro invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePayment = async () => {
    if (!validateStep2()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/votes/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: artist.id,
          voterName: form.name,
          voterEmail: form.email,
          voteCount: form.voteCount,
          paymentMethod: payment.method,
          paymentPhone: payment.phone
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStep(3);
        // Sauvegarder l'ID du vote pour la notification globale
        const myVotes = JSON.parse(localStorage.getItem('my_pending_votes') || '[]');
        myVotes.push(data.voteId);
        localStorage.setItem('my_pending_votes', JSON.stringify(myVotes));
      } else {
        setErrors({ global: data.message });
      }
    } catch (err) {
      setErrors({ global: "Erreur de connexion" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="vote-page-wrap" style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '80px', paddingTop: '100px' }}>
      <style>{`
        .vote-grid { display: grid; grid-template-columns: 1fr 1.2fr; min-height: 600px; }
        .vote-image-col { position: relative; min-height: 400px; }
        .vote-form-col { padding: 48px; background: #fff; }
        @media (max-width: 820px) {
          .vote-grid { grid-template-columns: 1fr; }
          .vote-image-col { min-height: 300px; }
          .vote-form-col { padding: 32px 24px; }
        }
        .vote-input { color: #0f172a !important; background-color: #ffffff !important; -webkit-text-fill-color: #0f172a !important; }
        .vote-input::placeholder { color: #94a3b8 !important; -webkit-text-fill-color: #94a3b8 !important; }
        .vote-input:focus { border-color: var(--accent-color) !important; box-shadow: 0 0 0 4px rgba(255, 85, 0, 0.1); }
        .vote-op-btn { flex: 1; padding: 16px; border-radius: 14px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s; font-family: Inter, sans-serif; font-weight: 700; border: 2px solid #f1f5f9; background: #fff; color: #64748b; }
        .vote-op-btn:hover { background: #f8fafc; border-color: #e2e8f0; }
        .vote-op-btn.active { border-color: var(--accent-color); background: rgba(255, 85, 0, 0.05); color: var(--accent-color); }
      `}</style>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Retour aux artistes
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} 
          style={{ borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.08)', background: '#fff' }} className="vote-grid"
        >
          <div className="vote-image-col">
            <img src={artist.imageUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }} />
            <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
              <Chip icon={<Music size={16} />} value={artist.genre} />
            </div>
            <div style={{ position: 'absolute', bottom: '32px', left: '32px' }}>
              <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>{artist.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', margin: '4px 0 16px' }}>{artist.city}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Chip icon={<Flame size={16} color="#ff5500" />} value={`${(artist.voteCount || 0)} votes`} />
              </div>
            </div>
          </div>

          <div className="vote-form-col">
            <Stepper step={step} />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>Votre vote</h2>
                  <p style={{ color: '#64748b', marginBottom: '32px' }}>Propulsez votre artiste préféré avec seulement 100 FCFA le vote.</p>
                  
                  <Field label="Nom complet" error={errors.name}>
                    <input className="vote-input" style={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Samuel Etoo" />
                  </Field>
                  <Field label="Adresse Email" error={errors.email}>
                    <input className="vote-input" type="email" style={inputStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="votre@email.com" />
                  </Field>
                  <Field label="Nombre de votes">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <input type="range" min="1" max="100" style={{ flex: 1, accentColor: 'var(--accent-color)' }} value={form.voteCount} onChange={e => setForm({...form, voteCount: parseInt(e.target.value)})} />
                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-color)' }}>{form.voteCount}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{total} FCFA</div>
                      </div>
                    </div>
                  </Field>
                  <button onClick={() => validateStep1() && setStep(2)} style={{ ...primaryBtn, marginTop: '12px' }}>Continuer</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Paiement</h2>
                  <Field label="Sélectionnez votre opérateur">
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['mtn', 'orange'].map(m => (
                        <button key={m} onClick={() => setPayment({...payment, method: m})} className={`vote-op-btn ${payment.method===m ? 'active' : ''}`}>
                          <img src={m === 'mtn' ? 'https://upload.wikimedia.org/wikipedia/commons/9/93/MTN_Logo.svg' : 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg'} alt={m} style={{ height: '24px' }} />
                          {m.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Numéro de téléphone" error={errors.phone}>
                    <input className="vote-input" style={inputStyle} value={payment.phone} onChange={e => setPayment({...payment, phone: e.target.value})} placeholder="6XXXXXXXX" />
                  </Field>
                  {errors.global && <p style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid #fee2e2' }}>{errors.global}</p>}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => setStep(1)} style={{ ...primaryBtn, background: '#f1f5f9', color: '#64748b', boxShadow: 'none' }}>Retour</button>
                    <button onClick={handlePayment} disabled={isProcessing} style={primaryBtn}>
                      {isProcessing ? 'Traitement...' : `Payer ${total} FCFA`}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && result && (
                <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 24px', width: '60px', height: '60px', borderWidth: '6px' }}></div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>En attente de confirmation...</h2>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '32px' }}>
                    Veuillez vérifier votre téléphone (<strong>{payment.phone}</strong>) et saisir votre code PIN pour valider le paiement de <strong>{total} FCFA</strong>.
                  </p>
                  <div style={{ padding: '16px', background: '#fef3c7', color: '#b45309', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                    Ne fermez pas cette page, le vote sera validé automatiquement.
                  </div>
                </motion.div>
              )}

              {step === 4 && result && (
                <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>
                    <Check size={40} color="#10b981" />
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Merci pour votre vote !</h2>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '32px' }}>
                    Votre paiement de <strong>{total} FCFA</strong> a été reçu avec succès.<br/>
                    Le classement a été mis à jour.
                  </p>
                  <Link to="/" style={{ ...primaryBtn, textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '16px 40px' }}>Retour à l'accueil</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
