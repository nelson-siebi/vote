import React from 'react';
import Scene3D from '../components/Scene3D';
import VotingArena from '../components/VotingArena';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Propulse <br/><span className="highlight">Ton Artiste</span></h1>
          <p>L'arène musicale N°1 au Cameroun. Découvre les talents de demain, soutiens-les et fais monter ton favori au sommet.</p>
          <button className="cta-button" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>Découvrir les Artistes ➔</button>
        </div>
        
        {/* 3D Canvas Area */}
        <div className="hero-3d-canvas">
          <Scene3D />
        </div>
      </header>

      {/* Voting Arena */}
      <VotingArena />
    </div>
  );
}
