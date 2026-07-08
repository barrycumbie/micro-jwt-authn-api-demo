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

## Using the published API (students)

If your instructor has already deployed this service, you do not need to clone this repository.

1. Set your API base URL in your front end.
2. Send `POST /api/authn/login` with the shared class password.
3. Store the returned JWT in `sessionStorage`.
4. Use token presence to gate your UI (show content when token exists).

Example:

```js
const API_BASE = 'http://<your-deployed-api-host>'; // e.g. http://136.116.192.154

async function login(password) {
  const res = await fetch(`${API_BASE}/api/authn/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) throw new Error('Login failed');

  const { token } = await res.json();
  sessionStorage.setItem('authToken', token);
}

function isLoggedIn() {
  return Boolean(sessionStorage.getItem('authToken'));
}
```

Health checks:

- `${API_BASE}/health`
- `${API_BASE}/api/authn/health`

If your app runs from localhost Live Server or GitHub Pages, CORS is enabled for those classroom origins.

For a full student walkthrough, see `JWT-STUDENT-PRIMER.md`.

---

## What it does

- Accepts a shared demo password (`cat` by default).
- Returns a signed JWT so front-end students can practise including
  `Authorization: Bearer <token>` headers in their requests.
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

## Local development (optional for maintainers)

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

Base URL examples:

- Published deployment: `http://<your-deployed-api-host>`
- Local development: `http://localhost:3000`

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
const API_BASE = 'http://<your-deployed-api-host>';

const res = await fetch(`${API_BASE}/api/authn/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'cat' }),
});
const { token } = await res.json();
sessionStorage.setItem('authToken', token);

// Charlie project pattern: token in sessionStorage means show content page.
if (sessionStorage.getItem('authToken')) {
  // show content UI
} else {
  // show login UI
}
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
