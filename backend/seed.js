const db = require('./src/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  try {
    console.log('Seeding database...');
    
    // Create tables
    await db.query(`CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS artists (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      genre VARCHAR(50),
      city VARCHAR(50),
      bio TEXT,
      image_url VARCHAR(255),
      audio_url VARCHAR(255),
      vote_count INT DEFAULT 0,
      view_count INT DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS votes (
      id VARCHAR(36) PRIMARY KEY,
      artist_id VARCHAR(36),
      voter_name VARCHAR(100),
      voter_email VARCHAR(100),
      vote_count INT,
      amount_fcfa INT,
      payment_method VARCHAR(20),
      payment_phone VARCHAR(20),
      payment_status VARCHAR(20) DEFAULT 'PENDING',
      transaction_id VARCHAR(100),
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS page_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      artist_id VARCHAR(36),
      source VARCHAR(50),
      referrer TEXT,
      user_agent TEXT,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(50) PRIMARY KEY,
      setting_value TEXT
    )`);

    // Add default admin
    const adminCount = await db.query('SELECT COUNT(*) as count FROM admin_users');
    if (adminCount[0][0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)', 
        [uuidv4(), 'admin', hashedPassword]);
      console.log('Admin user created: admin / admin123');
    }

    // Add default settings
    const settings = [
      ['logo_url', '/logo.png'],
      ['welcome_message', 'Bienvenue sur Promo des Artistes 237'],
      ['footer_text', '© 2024 Promo des Artistes 237. Tous droits réservés.'],
      ['algorithm', 'most_voted']
    ];

    for (const [key, value] of settings) {
      await db.query('INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
