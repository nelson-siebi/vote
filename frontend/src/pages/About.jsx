import React from 'react';
import { motion } from 'framer-motion';
import { Target, Vote, Globe, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: '120px', paddingBottom: '80px' }}>
      {/* Fond décoratif */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(255, 85, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(15, 23, 42, 0.03) 0%, transparent 50%)',
      }} />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '16px', fontFamily: 'Outfit, sans-serif' }}>
            À Propos de <span style={{ background: 'linear-gradient(135deg, #ff5500, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BeatVote</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
            La plateforme qui propulse les talents musicaux du Cameroun sur la scène nationale et internationale.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <InfoCard
            icon={<Target size={40} color="var(--accent-color)" />}
            title="Notre Mission"
            text="Promo des Artistes 237 est née de la volonté de donner aux artistes camerounais une vitrine numérique pour se faire connaître. Nous croyons que chaque talent mérite d'être entendu et soutenu par sa communauté."
            delay={0.1}
          />
          <InfoCard
            icon={<Vote size={40} color="var(--accent-color)" />}
            title="Comment ça marche ?"
            text="Les fans peuvent voter pour leurs artistes préférés à 100 FCFA par vote via Mobile Money (MTN ou Orange). Chaque vote compte et propulse l'artiste dans le classement. Les artistes les plus soutenus gagnent en visibilité et en opportunités."
            delay={0.2}
          />
          <InfoCard
            icon={<Globe size={40} color="var(--accent-color)" />}
            title="Made in Cameroun"
            text="Conçue au Cameroun, pour le Cameroun. Notre plateforme célèbre la richesse et la diversité de la scène musicale camerounaise, de l'Afrobeat au Makossa, du Hip-Hop au Bikutsi."
            delay={0.3}
          />
          <InfoCard
            icon={<ShieldCheck size={40} color="var(--accent-color)" />}
            title="Transparence & Sécurité"
            text="Chaque vote est enregistré de manière transparente. Les paiements sont sécurisés via nos partenaires de paiement mobile. Les résultats sont mis à jour en temps réel pour garantir l'intégrité du processus."
            delay={0.4}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        padding: '36px 40px',
        borderRadius: '24px',
        background: '#fff',
        border: '1px solid var(--border-light)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(255,85,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 85, 0, 0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
    >
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>{icon}</div>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.02rem' }}>{text}</p>
    </motion.div>
  );
}
