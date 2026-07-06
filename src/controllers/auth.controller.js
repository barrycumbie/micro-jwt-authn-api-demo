'use strict';

const { verifyPassword } = require('../services/password.service');
const { signToken } = require('../services/token.service');

/**
 * POST /api/authn/login
 *
 * Expects: { "password": "cat" }
 * Returns: { "token": "...", "token_type": "Bearer", "expires_in": "1h" }
 */
async function login(req, res, next) {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'password is required' });
    }

    const valid = await verifyPassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const tokenPayload = signToken();
    return res.status(200).json(tokenPayload);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/authn/health
 *
 * Returns a simple liveness check.
 */
function health(req, res) {
  return res.status(200).json({ status: 'ok', service: 'authn' });
}

module.exports = { login, health };
