const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beatvote237',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+01:00',
  // Active automatiquement le SSL pour Aiven Cloud ou si DB_SSL=true
  ssl: (process.env.DB_HOST?.includes('aivencloud.com') || process.env.DB_SSL === 'true') 
        ? { rejectUnauthorized: false } 
        : undefined
});

module.exports = pool;
