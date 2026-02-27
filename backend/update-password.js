const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./blog.db');

bcrypt.hash('admin', 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  
  db.run('UPDATE users SET password_hash = ? WHERE username = ?', [hash, 'admin'], function(err) {
    if (err) {
      console.error('Error updating password:', err);
      process.exit(1);
    }
    
    console.log('✅ Password updated successfully!');
    console.log('Username: admin');
    console.log('Password: admin');
    
    db.close();
  });
});
