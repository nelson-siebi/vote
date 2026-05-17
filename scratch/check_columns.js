const db = require('../backend/src/db');

async function checkColumns() {
  try {
    const [rows] = await db.query('DESCRIBE admin_users');
    console.log('Columns in admin_users:', rows.map(r => r.Field));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkColumns();
