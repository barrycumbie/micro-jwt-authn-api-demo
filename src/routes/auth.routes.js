'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { login, health } = require('../controllers/auth.controller');

const router = Router();

// Limit login attempts to prevent brute-force attacks.
// windowMs / max values can be tuned via environment variables.
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

router.post('/login', loginLimiter, login);
router.get('/health', health);

module.exports = router;
