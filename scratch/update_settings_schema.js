const db = require('../backend/src/db');

async function updateSchema() {
  try {
    const [columns] = await db.query('DESCRIBE site_settings');
    const hasLogoImage = columns.some(c => c.Field === 'logo_image');
    
    if (!hasLogoImage) {
      await db.query('ALTER TABLE site_settings ADD COLUMN logo_image VARCHAR(255) DEFAULT NULL AFTER logo_text');
      console.log('Column logo_image added successfully.');
    } else {
      console.log('Column logo_image already exists.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateSchema();
