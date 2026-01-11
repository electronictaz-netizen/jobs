# Environment Variables Setup Guide

This guide explains what environment variables you need and how to set them up.

## Quick Start

1. **For local development:**
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`
   - Fill in your values (see details below)

2. **For AWS deployment:**
   - Set variables in Elastic Beanstalk (backend)
   - Set variables in Amplify (frontend)
   - See deployment guides for details

---

## Server Environment Variables

### Location: `server/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | No (for SQLite) | PostgreSQL connection string. Leave empty for SQLite development | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | No | Environment mode (`development` or `production`) | `development` |
| `PORT` | No | Server port (default: 3001) | `3001` |
| `JWT_SECRET` | Yes | Secret key for JWT token signing | Generate secure random string |
| `AVIATIONSTACK_API_KEY` | Yes | API key for AviationStack flight data | Get from aviationstack.com |
| `FRONTEND_URL` | No | Frontend URL for CORS (development) | `http://localhost:3000` |
| `AMPLIFY_URL` | No | Amplify URL for CORS (production) | `https://app.amplifyapp.com` |

### Required Variables for Production:

```
DATABASE_URL=postgresql://username:password@host:5432/database
NODE_ENV=production
PORT=8080
JWT_SECRET=<generate-secure-random-string>
AVIATIONSTACK_API_KEY=<your-api-key>
FRONTEND_URL=https://your-frontend-url.com
AMPLIFY_URL=https://your-amplify-url.amplifyapp.com
```

### How to Generate JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Client Environment Variables

### Location: `client/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | No (uses proxy in dev) | Backend API URL. Leave empty for development (uses Vite proxy) | `https://api.example.com` |

### Development vs Production:

**Development:**
- Leave `VITE_API_URL` empty
- Vite will use the proxy configured in `vite.config.ts` (proxies to `http://localhost:3001`)

**Production:**
- Set `VITE_API_URL` to your backend URL
- Example: `VITE_API_URL=https://transportation-api.us-east-1.elasticbeanstalk.com`

---

## Setup Instructions

### Step 1: Create Server .env File

```bash
cd server
cp .env.example .env
```

Then edit `server/.env` and fill in:
- `JWT_SECRET` (generate one)
- `AVIATIONSTACK_API_KEY` (get from aviationstack.com)
- `DATABASE_URL` (optional for SQLite, required for PostgreSQL)

### Step 2: Create Client .env File

```bash
cd client
cp .env.example .env
```

For development, you can leave `VITE_API_URL` empty (it will use the proxy).

For production, set `VITE_API_URL` to your backend URL.

### Step 3: Test Locally

```bash
# Terminal 1: Start server
cd server
npm install
npm run dev

# Terminal 2: Start client
cd client
npm install
npm run dev
```

---

## Database Configuration

### Option 1: SQLite (Development - Default)

Leave `DATABASE_URL` empty or commented out. The app will use SQLite automatically.

```env
# DATABASE_URL=
```

### Option 2: PostgreSQL (Production)

Set `DATABASE_URL` with your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Examples:**
- Local: `postgresql://postgres:mypassword@localhost:5432/transportation`
- RDS: `postgresql://admin:mypassword@transportation-db.xxxxx.us-east-1.rds.amazonaws.com:5432/transportation`

**Important:** URL encode special characters in passwords!

---

## Security Notes

1. **Never commit `.env` files to git**
   - They're already in `.gitignore`
   - `.env.example` files are safe to commit (they contain no secrets)

2. **Generate secure JWT_SECRET**
   - Use the command: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Never use the example value in production

3. **Keep API keys secret**
   - Don't share `.env` files
   - Don't paste API keys in chat/code
   - Use environment variables in deployment platforms

---

## Deployment Configuration

### Elastic Beanstalk (Backend)

Set environment variables in:
- AWS Console → Elastic Beanstalk → Your Environment → Configuration → Software → Environment properties

Required variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `AVIATIONSTACK_API_KEY`
- `NODE_ENV=production`
- `PORT=8080`
- `FRONTEND_URL` (optional)
- `AMPLIFY_URL` (optional)

### AWS Amplify (Frontend)

Set environment variables in:
- AWS Amplify Console → Your App → Environment variables

Required variables:
- `VITE_API_URL` (your backend URL)

---

## Troubleshooting

### "JWT_SECRET is not defined"
- Make sure `server/.env` exists
- Check that `JWT_SECRET` is set in the file
- Restart the server after creating/editing `.env`

### "Cannot connect to database"
- Check `DATABASE_URL` format (if using PostgreSQL)
- Verify database is running and accessible
- For PostgreSQL, test connection: `psql "DATABASE_URL"`

### "API calls failing"
- Check `VITE_API_URL` is set correctly (production)
- For development, make sure server is running on port 3001
- Check CORS configuration if calling from browser

### Environment variables not loading
- Make sure `.env` file is in the correct directory (`server/` or `client/`)
- Restart the server/client after changing `.env`
- Check for typos in variable names (they're case-sensitive)

---

## Example .env Files

### server/.env (Development)
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
AVIATIONSTACK_API_KEY=your-key-here
FRONTEND_URL=http://localhost:3000
```

### server/.env (Production/PostgreSQL)
```env
DATABASE_URL=postgresql://admin:mypassword@transportation-db.xxxxx.us-east-1.rds.amazonaws.com:5432/transportation
NODE_ENV=production
PORT=8080
JWT_SECRET=<generate-secure-random-string>
AVIATIONSTACK_API_KEY=your-key-here
FRONTEND_URL=https://your-frontend-url.com
AMPLIFY_URL=https://your-app.amplifyapp.com
```

### client/.env (Development)
```env
# Leave empty - uses Vite proxy
VITE_API_URL=
```

### client/.env (Production)
```env
VITE_API_URL=https://transportation-api.us-east-1.elasticbeanstalk.com
```
