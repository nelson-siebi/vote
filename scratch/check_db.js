const db = require('../backend/src/db');

async function checkArtists() {
  try {
    const [rows] = await db.query('SELECT id, name FROM artists');
    console.log(`Found ${rows.length} artists in database:`);
    rows.forEach(r => console.log(`- [${r.id}] ${r.name}`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkArtists();
