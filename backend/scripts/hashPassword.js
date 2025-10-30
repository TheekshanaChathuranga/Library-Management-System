// Run this script to generate hashed passwords for staff members
// Usage: node scripts/hashPassword.js

const bcrypt = require('bcryptjs');

const passwords = {
    'admin_saman': 'admin123',
    'nimesha_lib': 'librarian123',
    'kasun_lib': 'librarian123'
};

console.log('\n=== Password Hashing Utility ===\n');

for (const [username, password] of Object.entries(passwords)) {
    const hash = bcrypt.hashSync(password, 10);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log(`\nSQL Update:`);
    console.log(`UPDATE Staff SET password_hash = '${hash}' WHERE username = '${username}';\n`);
    console.log('---\n');
}

console.log('Copy the SQL UPDATE statements and run them in MySQL to set passwords.\n');
