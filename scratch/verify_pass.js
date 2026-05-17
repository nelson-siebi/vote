const bcrypt = require('bcryptjs');

const hash = '$2a$10$haprPOx91HvNC9En4xOdhuGajqJ96KdHdgYNlA0xPxHMJh3yI7Yp2';
const password = 'admin'; // Or admin123 or admin237

async function verify() {
  console.log('Testing "admin":', await bcrypt.compare('admin', hash));
  console.log('Testing "admin123":', await bcrypt.compare('admin123', hash));
  console.log('Testing "admin237":', await bcrypt.compare('admin237', hash));
  process.exit(0);
}

verify();
