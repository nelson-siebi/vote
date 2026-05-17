-- ============================================================
--  Promo des Artistes 237 — Schéma MySQL
--  Créer la base puis exécuter ce fichier :
--    CREATE DATABASE beatvote237 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ============================================================

CREATE DATABASE IF NOT EXISTS beatvote237
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE beatvote237;

-- ── Artists ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS artists (
  id         VARCHAR(36)  NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  slug       VARCHAR(150) UNIQUE,
  name       VARCHAR(150) NOT NULL,
  genre      VARCHAR(80)  NOT NULL,
  city       VARCHAR(100) DEFAULT 'Douala',
  bio        TEXT,
  image_url  VARCHAR(512),
  audio_url  VARCHAR(512),
  vote_count INT          NOT NULL DEFAULT 0,
  view_count INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT NOW(),
  updated_at DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

-- ── Votes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
  id               VARCHAR(36)  NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  artist_id        VARCHAR(36)  NOT NULL,
  voter_name       VARCHAR(150) NOT NULL,
  voter_email      VARCHAR(255) NOT NULL,
  vote_count       INT          NOT NULL DEFAULT 1,
  amount_fcfa      INT          NOT NULL,           -- vote_count * 100
  payment_method   ENUM('MTN', 'ORANGE') NOT NULL,
  payment_phone    VARCHAR(20)  NOT NULL,
  transaction_id   VARCHAR(100),                    -- Ref NelsiusPay
  payment_status   ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  ip_address       VARCHAR(45),
  user_agent       TEXT,
  created_at       DATETIME NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_votes_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);

CREATE INDEX idx_votes_artist  ON votes(artist_id);
CREATE INDEX idx_votes_email   ON votes(voter_email);
CREATE INDEX idx_votes_status  ON votes(payment_status);
CREATE INDEX idx_votes_created ON votes(created_at);

-- ── Page Views ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  artist_id  VARCHAR(36),                           -- NULL = page accueil
  source     VARCHAR(100),                          -- google, facebook, direct, etc.
  referrer   VARCHAR(512),
  user_agent TEXT,
  ip_address VARCHAR(45),
  session_id VARCHAR(100),
  created_at DATETIME NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_views_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
);

CREATE INDEX idx_views_artist  ON page_views(artist_id);
CREATE INDEX idx_views_source  ON page_views(source);
CREATE INDEX idx_views_created ON page_views(created_at);

-- ── Admin Users ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(80)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT NOW()
);

-- Mot de passe par défaut : admin237 (bcrypt)
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin', '$2b$10$rQvJm1RxJt7/1KVHpNVEbu5vTg6I9v1FzM7a1L9J7L8zX3WqxeOde')
ON DUPLICATE KEY UPDATE username = username;

-- ── Données de démo ────────────────────────────────────────
INSERT INTO artists (id, name, genre, city, bio, vote_count, view_count) VALUES
  ('1', 'Aya Nakam',   'Afrobeat / Pop', 'Douala',  'Artiste montante de la scène camerounaise.', 1450, 12450),
  ('2', 'Leo Blaze',   'Rap / Trap',     'Yaoundé', 'Pionnier du rap urbain au Cameroun.',        890,  9800),
  ('3', 'Carine N.',   'Gospel / Soul',  'Douala',  'Voix puissante aux accents de soul.',        2100, 18200),
  ('4', 'DJ Kratos',   'Afro / EDM',     'Bafoussam','Les rythmes africains fusionnés à l\'EDM.', 640,  7200),
  ('5', 'Vanessa B.',  'RnB / Zouk',     'Limbé',   'RnB doux au croisement du zouk.',            1150, 10900),
  ('6', 'Prince M.',   'Afrobeats',      'Yaoundé', 'L\'énergie des stades dans chaque titre.',   1800, 15600)
ON DUPLICATE KEY UPDATE name = VALUES(name);
