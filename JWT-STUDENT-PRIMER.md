# JWT Primer for Students (Charlie Project)

## Why this API exists

In this class project, this service gives you a simple way to practice authentication concepts without building a full user account system.

What this API does:

- Verifies a shared class password (demo password).
- Issues a signed JWT (JSON Web Token).
- Lets your front end send that token in an `Authorization` header to protected APIs.

What this API does *not* do:

- It is not multi-user auth.
- It does not manage sessions or logout server-side.
- It does not revoke tokens.
- It is for learning, not production.

---

## The flow in plain English

1. Your app sends a password to the auth endpoint.
2. The auth service checks that password against a bcrypt hash.
3. If valid, it signs a JWT and returns it.
4. Your app stores that token (typically in `sessionStorage` for class work).
5. Your app includes `Authorization: Bearer <token>` on later requests.

---

## Endpoints you will use

Base URL examples:

- Local API: `http://localhost:3000`
- Deployed API: `http://<your-api-ip-or-domain>` (or HTTPS if configured)

Auth endpoints:

- `GET /health`
- `GET /api/authn/health`
- `POST /api/authn/login`

Login request body:

```json
{ "password": "cat" }
```

Login success response:

```json
{
  "token": "<signed-jwt>",
  "token_type": "Bearer",
  "expires_in": "1h"
}
```

---

## Front-end implementation pattern

## 1) Login and get token

```js
async function loginToAuthApi(password) {
  const API_BASE = 'http://YOUR_API_HOST'; // e.g. http://localhost:3000

  const response = await fetch(`${API_BASE}/api/authn/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }

  const payload = await response.json();
  sessionStorage.setItem('authToken', payload.token);
  return payload;
}
```

## 2) Charlie project pattern: token present = show content page

For this project, a common pattern is:

- If a token exists in `sessionStorage`, consider the student logged in.
- Show protected UI (content page, add/edit UI, favorites UI).
- If no token exists, show the login page.

```js
function hasToken() {
  return Boolean(sessionStorage.getItem('authToken'));
}

function routeByAuthState() {
  const loginView = document.getElementById('login-view');
  const contentView = document.getElementById('content-view');

  if (hasToken()) {
    loginView.classList.add('d-none');
    contentView.classList.remove('d-none');
  } else {
    contentView.classList.add('d-none');
    loginView.classList.remove('d-none');
  }
}

// Run on page load
routeByAuthState();
```

After successful login:

```js
async function handleLogin(password) {
  const payload = await loginToAuthApi(password);
  sessionStorage.setItem('authToken', payload.token);
  routeByAuthState();
}
```

This is a UI/auth-state gate and is appropriate for classroom demos.

## 3) Optional: use token in protected API calls

```js
async function fetchProtectedData() {
  const API_BASE = 'http://YOUR_API_HOST';
  const token = sessionStorage.getItem('authToken');

  if (!token) {
    throw new Error('No token found. Please log in first.');
  }

  const response = await fetch(`${API_BASE}/api/your-protected-route`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
```

## 4) Logout in class apps

```js
function logout() {
  sessionStorage.removeItem('authToken');
}
```

---

## Localhost + GitHub Pages notes

This auth API is configured to allow browser requests from:

- `http://localhost:<port>`
- `https://localhost:<port>`
- `http://127.0.0.1:<port>`
- `https://127.0.0.1:<port>`
- `https://<username>.github.io`

So students can test from Live Server locally and from GitHub Pages deployments.

If you use a custom domain (not `github.io`), ask the instructor to add that origin to the API CORS allowlist.

---

## Recommended student auth helper

```js
const AUTH = {
  tokenKey: 'authToken',

  get token() {
    return sessionStorage.getItem(this.tokenKey);
  },

  set token(value) {
    sessionStorage.setItem(this.tokenKey, value);
  },

  clear() {
    sessionStorage.removeItem(this.tokenKey);
  },

  authHeaders(extra = {}) {
    const token = this.token;
    return {
      ...extra,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
};
```

Use it like:

```js
const response = await fetch(`${API_BASE}/api/your-protected-route`, {
  headers: AUTH.authHeaders({ 'Content-Type': 'application/json' }),
});
```

---

## Fallback mode (project requirement)

Your project mentions a fallback with a hardcoded password. A clean way to do that:

- First, try API login.
- If API login fails due to network/server outage, optionally allow a local fallback path.
- Clearly label fallback mode in the UI (for transparency).
- Do not keep fallback enabled in real apps.

Example strategy:

```js
async function loginWithFallback(inputPassword) {
  try {
    return await loginToAuthApi(inputPassword);
  } catch (err) {
    // Demo fallback only for classroom continuity
    if (inputPassword === 'cat') {
      return { token: null, mode: 'fallback' };
    }
    throw err;
  }
}
```

---

## Common mistakes to avoid

- Sending token without `Bearer ` prefix.
- Forgetting `Content-Type: application/json` on login POST.
- Calling wrong URL path (`/api/authn/login` is required).
- Testing the API through wrong port (Nginx setups often use port 80 publicly, not 3000).
- Storing long-term auth in `localStorage` without understanding tradeoffs.

---

## Security discussion points for class

- Why hash passwords (bcrypt) instead of storing plain text.
- Why signed JWTs allow tamper detection.
- Why token expiration matters (`expires_in`).
- Why CORS should be restricted to known origins.
- Why this demo is AuthN practice, not full AuthZ architecture.

---

## Quick student checklist

- [ ] I can call `/api/authn/login` from my app.
- [ ] I store the returned token after login.
- [ ] I attach `Authorization: Bearer <token>` to protected requests.
- [ ] I handle 400/401 errors with clear user messages.
- [ ] I can run from localhost and GitHub Pages.
- [ ] I can explain why this is demo auth and not production auth.
