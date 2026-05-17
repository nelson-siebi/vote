const db = require('../backend/src/db');

async function checkAdmins() {
  try {
    const [rows] = await db.query('SELECT username, password_hash FROM admin_users');
    console.log('Admin Users:');
    rows.forEach(r => console.log(`- Username: ${r.username}, Hash: ${r.password_hash}`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmins();
