const db = require('../backend/src/db');

async function checkTables() {
  try {
    const [rows] = await db.query('SHOW TABLES');
    console.log('Tables in database:', rows.map(r => Object.values(r)[0]));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTables();
