'use strict';

const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Set env vars before loading the app
const TEST_SECRET = 'test-secret-do-not-use-in-production';
const TEST_EXPIRES_IN = '1h';

beforeAll(async () => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.JWT_EXPIRES_IN = TEST_EXPIRES_IN;
  process.env.AUTHN_PASSWORD_HASH = await bcrypt.hash('cat', 10);
});

// Require app AFTER env vars are set
let app;
beforeAll(() => {
  app = require('../src/server');
});

describe('GET /api/authn/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/authn/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'authn' });
  });
});

describe('POST /api/authn/login', () => {
  it('returns 200 and a valid JWT for the correct password', async () => {
    const res = await request(app)
      .post('/api/authn/login')
      .send({ password: 'cat' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token_type).toBe('Bearer');
    expect(res.body.expires_in).toBe('1h');

    // Verify the token is actually valid
    const decoded = jwt.verify(res.body.token, TEST_SECRET);
    expect(decoded.authenticated).toBe(true);
  });

  it('returns 401 for an incorrect password', async () => {
    const res = await request(app)
      .post('/api/authn/login')
      .send({ password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when password field is missing', async () => {
    const res = await request(app).post('/api/authn/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/authn/login');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
