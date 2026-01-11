# Quick Reference: .env Files

## Server .env File (`server/.env`)

Create this file in the `server/` directory:

```env
# Database (optional for development - leave empty for SQLite)
DATABASE_URL=

# Server Configuration
NODE_ENV=development
PORT=3001

# Security - REQUIRED - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-secret-key-here-CHANGE-THIS

# API Keys - REQUIRED
AVIATIONSTACK_API_KEY=your-aviationstack-api-key

# CORS URLs (optional)
FRONTEND_URL=http://localhost:3000
AMPLIFY_URL=
```

**Minimum required for development:**
- `JWT_SECRET` (generate a secure random string)
- `AVIATIONSTACK_API_KEY` (get from aviationstack.com)

**For PostgreSQL (production):**
- Add `DATABASE_URL=postgresql://user:pass@host:5432/db`

---

## Client .env File (`client/.env`)

Create this file in the `client/` directory:

```env
# API URL (leave empty for development - uses Vite proxy)
VITE_API_URL=
```

**Development:**
- Leave `VITE_API_URL` empty (uses proxy to `http://localhost:3001`)

**Production:**
- Set `VITE_API_URL=https://your-backend.elasticbeanstalk.com`

---

## Quick Setup Commands

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Create server .env:**
```bash
cd server
# Copy the content above into a new .env file
```

**Create client .env:**
```bash
cd client
# Copy the content above into a new .env file
```

---

For detailed information, see `ENV_SETUP.md`
