const crypto = require('crypto');

const algorithm = 'aes-128-cbc';
const key = crypto.randomBytes(16); // Must be 16 bytes for aes-128
const iv = crypto.randomBytes(16);  // AES block size is 16 bytes

const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update('Hello World', 'utf8', 'hex');
encrypted += cipher.final('hex');

console.log('Encrypted:', encrypted);
