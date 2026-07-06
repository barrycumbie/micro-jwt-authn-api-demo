'use strict';

const jwt = require('jsonwebtoken');

/**
 * Sign a new JWT.
 *
 * @returns {{ token: string, token_type: string, expires_in: string }}
 */
function signToken() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in the environment');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  const token = jwt.sign({ authenticated: true }, secret, { expiresIn });
  return {
    token,
    token_type: 'Bearer',
    expires_in: expiresIn,
  };
}

module.exports = { signToken };
