import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, MessageCircle, MapPin } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation d'envoi
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px', fontSize: '0.95rem',
    fontFamily: 'Inter, sans-serif', color: '#0f172a',
    background: '#fff', outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '120px', paddingBottom: '80px' }}>
      {/* Fond décoratif */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at 70% 20%, rgba(255, 85, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(15, 23, 42, 0.03) 0%, transparent 50%)',
      }} />

      <div style={{ maxWidth: '650px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '50px' }}
        >
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>
            Nous <span style={{ background: 'linear-gradient(135deg, #ff5500, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Contacter</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            Une question, une suggestion ou un partenariat ? N'hésitez pas à nous écrire.
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '60px 40px', borderRadius: '30px', textAlign: 'center', background: '#fff', border: '1px solid var(--border-light)', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
          >
            <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 24px' }}>
              <Check size={40} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>Message envoyé !</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '30px' }}>
              Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.
            </p>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              className="cta-button"
              style={{ padding: '14px 36px', fontSize: '0.95rem' }}
            >
              Envoyer un autre message
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            style={{ padding: '48px 44px', borderRadius: '30px', background: '#fff', border: '1px solid var(--border-light)', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}
          >
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Nom complet</label>
              <input
                style={inputStyle}
                placeholder="Votre nom"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                onFocus={e => { e.target.style.borderColor = '#ff5500'; e.target.style.boxShadow = '0 0 0 4px rgba(255,85,0,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                placeholder="votre@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                onFocus={e => { e.target.style.borderColor = '#ff5500'; e.target.style.boxShadow = '0 0 0 4px rgba(255,85,0,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Sujet</label>
              <input
                style={inputStyle}
                placeholder="L'objet de votre message"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                required
                onFocus={e => { e.target.style.borderColor = '#ff5500'; e.target.style.boxShadow = '0 0 0 4px rgba(255,85,0,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Message</label>
              <textarea
                style={{ ...inputStyle, height: '140px', resize: 'vertical' }}
                placeholder="Votre message..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                required
                onFocus={e => { e.target.style.borderColor = '#ff5500'; e.target.style.boxShadow = '0 0 0 4px rgba(255,85,0,0.05)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button
              type="submit"
              className="cta-button"
              style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Envoyer le message
            </button>
          </motion.form>
        )}

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginTop: '48px' }}
        >
          <ContactInfo icon={<Mail size={24} color="#ff5500" />} label="Email" value="contact@beatvote237.com" />
          <ContactInfo icon={<MessageCircle size={24} color="#ff5500" />} label="WhatsApp" value="+237 6XX XXX XXX" />
          <ContactInfo icon={<MapPin size={24} color="#ff5500" />} label="Localisation" value="Douala, Cameroun" />
        </motion.div>
      </div>
    </div>
  );
}

function ContactInfo({ icon, label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>{value}</div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#64748b',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};
