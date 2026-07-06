# micro-jwt-authn-api-demo

> ⚠️ **DEMO ONLY — NOT FOR PRODUCTION USE** ⚠️
>
> This service is a teaching tool designed to let front-end students retrieve a
> JWT with a single shared password. It does **not** implement multi-user accounts,
> session management, token revocation, rate limiting, or any of the other controls
> required for a real authentication system.
> **Never deploy this as-is to a public-facing server with real user data.**

A simple JWT authentication micro-service for web-dev classroom use.

---

## What it does

- Accepts a shared demo password (`cat` by default).
- Returns a signed JWT so front-end students can practise including
  `Authorization: ****** headers in their requests.
- Stores the password as a **bcrypt hash** in the environment — the plaintext
  password is never written anywhere in the source code.

---

## Project structure

```
.
├── src/
│   ├── server.js                 # Express entry-point
│   ├── routes/
│   │   └── auth.routes.js        # Route definitions
│   ├── controllers/
│   │   └── auth.controller.js    # Request handlers
│   ├── services/
│   │   ├── token.service.js      # JWT sign helper
│   │   └── password.service.js   # bcrypt compare helper
│   └── middleware/
│       └── error.middleware.js   # Central error handler
├── scripts/
│   └── hash-password.js          # CLI tool to (re-)generate AUTHN_PASSWORD_HASH
├── tests/
│   └── auth.test.js              # Jest + Supertest integration tests
├── .env.example                  # Copy to .env and fill in values
└── package.json
```

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/barrycumbie/micro-jwt-authn-api-demo.git
cd micro-jwt-authn-api-demo
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set a strong `JWT_SECRET`:

```env
AUTHN_PASSWORD_HASH=$2b$12$kI7lYDXR.WzPDTrRPgGM1uA6IqpwY0LSzYvbb7Cba24uUgMBn5SCu
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=1h
PORT=3000
```

> The hash above is pre-generated for the demo password `"cat"`.
> To use a different password, run `npm run hash-password yourPassword` and
> update `AUTHN_PASSWORD_HASH` with the printed value.

### 3. Run

```bash
npm start          # production
npm run dev        # development (auto-reload with nodemon)
```

---

## API

Base path: `/api/authn`

### `GET /api/authn/health`

Liveness check.

**Response `200 OK`**
```json
{ "status": "ok", "service": "authn" }
```

---

### `POST /api/authn/login`

Exchange the shared demo password for a JWT.

**Request body**
```json
{ "password": "cat" }
```

**Response `200 OK`**
```json
{
  "token": "<signed-jwt>",
  "token_type": "Bearer",
  "expires_in": "1h"
}
```

**Error responses**

| Status | Meaning                        |
|--------|--------------------------------|
| `400`  | `password` field missing       |
| `401`  | Password incorrect             |
| `500`  | Server / configuration error   |

---

## Using the token in a front-end request

```js
const res = await fetch('http://localhost:3000/api/authn/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'cat' }),
});
const { token } = await res.json();

// Then attach it to subsequent API calls:
const data = await fetch('http://localhost:3000/api/some-protected-route', {
  headers: { Authorization: `****** },
});
```

---

## Re-generating the password hash

If you want to change the demo password, run the helper script:

```bash
npm run hash-password          # hashes "cat" (default)
npm run hash-password myPwd    # hashes "myPwd"
```

Copy the printed hash value into your `.env` file as `AUTHN_PASSWORD_HASH`.

---

## Tests

```bash
npm test
```

Uses [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest).

---

## Environment variables reference

| Variable               | Required | Default   | Description                                     |
|------------------------|----------|-----------|-------------------------------------------------|
| `AUTHN_PASSWORD_HASH`  | ✅        | —         | bcrypt hash of the demo password                |
| `JWT_SECRET`           | ✅        | —         | Secret used to sign JWTs                        |
| `JWT_EXPIRES_IN`       | ❌        | `1h`      | Token lifetime (jsonwebtoken format)            |
| `PORT`                 | ❌        | `3000`    | Port the service listens on                     |
| `RATE_LIMIT_WINDOW_MS` | ❌        | `900000`  | Rate-limit window in ms (default 15 min)        |
| `RATE_LIMIT_MAX`       | ❌        | `20`      | Max login requests per IP per window            |

---

## ⚠️ Teaching notes / security reminder

This service is intentionally simplified for classroom demonstration:

- **One shared password** — in a real system every user has their own credentials.
- **No token revocation** — once issued, a token is valid until it expires.
- **No HTTPS** — add TLS termination (nginx, a load-balancer, or `https` module) before exposing to the internet.
- **No rate limiting** — a real service would throttle repeated login attempts.

Use it as a starting point for discussing what *real* authentication looks like, not as a template to copy into production.
