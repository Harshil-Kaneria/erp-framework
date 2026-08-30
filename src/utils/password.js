const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash password string securely using bcrypt
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain password against stored hash
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword,
};
