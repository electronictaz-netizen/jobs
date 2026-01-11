# AWS Amplify Deployment Guide

This guide will help you deploy the Aircrew Transportation Management System to AWS Amplify.

## Important Architecture Notes

**AWS Amplify can host your React frontend**, but your Node.js/Express backend needs to be deployed separately. Here are your options:

1. **AWS Elastic Beanstalk** (Recommended for beginners)
2. **AWS EC2** (More control, more setup)
3. **AWS App Runner** (Modern serverless container service)
4. **AWS Lambda + API Gateway** (Serverless, requires refactoring)

## Prerequisites

- AWS Account
- GitHub repository with your code
- AviationStack API key
- (Recommended) AWS RDS PostgreSQL database (SQLite won't work in cloud environments)

---

## Step 1: Set Up Database (Required)

SQLite files don't work well in cloud/serverless environments. You need a cloud database.

### Option A: AWS RDS PostgreSQL (Recommended)

1. Go to AWS RDS Console
2. Create a PostgreSQL database:
   - Engine: PostgreSQL (latest version)
   - Template: Free tier (if eligible)
   - DB instance identifier: `transportation-db`
   - Master username: `admin` (or your choice)
   - Master password: **Save this securely!**
   - Public access: **Yes** (for now, you can restrict later with VPC)
   - VPC security group: Create new or use default
3. After creation, note the **Endpoint** URL (e.g., `transportation-db.xxxxx.us-east-1.rds.amazonaws.com`)
4. Update security group to allow inbound connections on port 5432 from your IP/0.0.0.0/0 (for testing)

### Option B: Use a Database Migration Service

You'll need to migrate your SQLite schema to PostgreSQL. Consider using a migration tool or manually creating the tables.

---

## Step 2: Deploy Backend API

### Option A: AWS Elastic Beanstalk (Easiest)

1. **Prepare Backend for Deployment:**
   - Update `server/src/database.ts` to use PostgreSQL instead of SQLite
   - Install PostgreSQL client: `cd server && npm install pg`
   - Update database connection code

2. **Create Elastic Beanstalk Application:**
   - Go to AWS Elastic Beanstalk Console
   - Click "Create Application"
   - Application name: `transportation-api`
   - Platform: Node.js
   - Platform branch: Node.js 18 running on 64bit Amazon Linux 2023
   - Application code: Upload your `server` folder as a ZIP file

3. **Configure Environment Variables:**
   In Elastic Beanstalk → Configuration → Software → Environment properties, add:
   ```
   PORT=8080
   NODE_ENV=production
   JWT_SECRET=your-very-secure-random-secret-key-here
   AVIATIONSTACK_API_KEY=your-aviationstack-api-key
   DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/postgres
   ```

4. **Note the API URL:** Elastic Beanstalk will provide a URL like `http://transportation-api.us-east-1.elasticbeanstalk.com`

### Option B: AWS App Runner (Modern Alternative)

1. Create a Dockerfile in your `server` directory
2. Use AWS App Runner to deploy from GitHub
3. Set environment variables in App Runner console

---

## Step 3: Configure Frontend for Production

### 3.1 Update API Configuration

Create `client/src/config.ts`:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Update `client/src/contexts/AuthContext.tsx` to use the API URL.

### 3.2 Update Vite Configuration

Update `client/vite.config.ts` to remove the proxy in production.

---

## Step 4: Deploy Frontend to AWS Amplify

1. **Go to AWS Amplify Console:**
   - Sign in to AWS Console
   - Navigate to AWS Amplify
   - Click "New app" → "Host web app"

2. **Connect Repository:**
   - Choose GitHub
   - Authorize AWS Amplify
   - Select your repository
   - Select the branch (usually `main` or `master`)

3. **Configure Build Settings:**
   Amplify should auto-detect the `amplify.yml` file. If not, use these build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd client
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: client/dist
       files:
         - '**/*'
     cache:
       paths:
         - client/node_modules/**/*
   ```

4. **Set Environment Variables:**
   In Amplify Console → App settings → Environment variables, add:
   ```
   VITE_API_URL=https://your-backend-api-url.com
   ```

5. **Review and Deploy:**
   - Review the settings
   - Click "Save and deploy"
   - Wait for the build to complete

6. **Get Your Frontend URL:**
   Amplify will provide a URL like `https://main.xxxxx.amplifyapp.com`

---

## Step 5: Update CORS Settings

Update your backend CORS configuration to allow your Amplify domain:

In `server/src/index.ts`, update the CORS configuration:

```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-amplify-app.amplifyapp.com',
    'https://*.amplifyapp.com' // Or be more specific
  ],
  credentials: true
}));
```

Redeploy your backend after this change.

---

## Step 6: Verify Deployment

1. Visit your Amplify app URL
2. Try logging in with the admin credentials
3. Test creating a job
4. Verify API calls are working (check browser DevTools → Network)

---

## Troubleshooting

### Frontend can't connect to backend
- Verify `VITE_API_URL` environment variable is set correctly
- Check CORS settings in backend
- Verify backend is running and accessible

### Database connection issues
- Verify RDS security group allows connections
- Check database credentials
- Verify DATABASE_URL format: `postgresql://user:pass@host:5432/dbname`

### Build failures
- Check build logs in Amplify console
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

---

## Next Steps (Recommended)

1. **Set up custom domain** in Amplify
2. **Enable HTTPS** (Amplify does this automatically)
3. **Set up CI/CD** (Amplify does this automatically from GitHub)
4. **Database backups** in RDS
5. **Environment-specific configs** (staging/production)
6. **Monitoring** with CloudWatch
7. **Restrict RDS access** to only your backend (use VPC)

---

## Cost Estimation (Approximate)

- **AWS Amplify:** Free tier available, then ~$0.15/GB served + $0.025/GB stored
- **AWS RDS PostgreSQL:** Free tier (t2.micro) for 12 months, then ~$15-20/month
- **AWS Elastic Beanstalk:** Free tier available, then ~$10-30/month depending on instance
- **Data transfer:** First 100GB/month free, then $0.09/GB

Total estimated cost: **$15-50/month** after free tier expires (depending on usage).
