#!/usr/bin/env node
'use strict';

/**
 * Utility script: generate a bcrypt hash for a given password.
 *
 * Usage:
 *   node scripts/hash-password.js [password]
 *   npm run hash-password
 *
 * If no password argument is provided it defaults to "cat" (the demo password).
 * Copy the output value into your .env file as AUTHN_PASSWORD_HASH.
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;
const password = process.argv[2] || 'cat';

bcrypt
  .hash(password, SALT_ROUNDS)
  .then((hash) => {
    console.log(`\nPassword : ${password}`);
    console.log(`Hash     : ${hash}`);
    console.log(`\nAdd the following line to your .env file:`);
    console.log(`AUTHN_PASSWORD_HASH=${hash}\n`);
  })
  .catch((err) => {
    console.error('Error hashing password:', err.message);
    process.exit(1);
  });
