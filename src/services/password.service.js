'use strict';

const bcrypt = require('bcrypt');

/**
 * Compare a plain-text password against a bcrypt hash stored in the
 * AUTHN_PASSWORD_HASH environment variable.
 *
 * @param {string} plainPassword - The raw password submitted by the client.
 * @returns {Promise<boolean>} Resolves to true when the password matches.
 */
async function verifyPassword(plainPassword) {
  const hash = process.env.AUTHN_PASSWORD_HASH;
  if (!hash) {
    throw new Error('AUTHN_PASSWORD_HASH is not set in the environment');
  }
  return bcrypt.compare(plainPassword, hash);
}

module.exports = { verifyPassword };
