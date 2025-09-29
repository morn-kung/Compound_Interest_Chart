const text = 'likit.se4498';
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update(text).digest('hex');
console.log('Password:', text);
console.log('SHA-256 Hash:', hash);