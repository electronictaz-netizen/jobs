# Step-by-Step AWS Deployment Guide

This guide walks you through deploying the Aircrew Transportation Management System to AWS.

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] GitHub repository with your code
- [ ] AviationStack API key
- [ ] AWS CLI installed (optional, for easier deployment)

---

## Step 1: Set Up AWS RDS PostgreSQL Database

### 1.1 Create RDS Instance

1. Go to AWS Console → RDS
2. Click "Create database"
3. Choose:
   - **Database creation method**: Standard create
   - **Engine type**: PostgreSQL
   - **Version**: Latest (e.g., PostgreSQL 15.x)
   - **Template**: Free tier (if eligible) or Production
   - **DB instance identifier**: `transportation-db`
   - **Master username**: `admin` (or your choice)
   - **Master password**: Create a strong password (SAVE THIS!)
   - **DB instance class**: `db.t3.micro` (free tier) or `db.t3.small`
   - **Storage**: 20 GB (free tier) or as needed
   - **VPC**: Default VPC
   - **Public access**: **Yes** (for now - you can restrict later)
   - **VPC security group**: Create new or use default
   - **Database name**: `transportation`

4. Click "Create database"
5. Wait 5-10 minutes for database to be created

### 1.2 Configure Security Group

1. Go to RDS → Your database → Connectivity & security
2. Click on the VPC security group
3. Click "Edit inbound rules"
4. Add rule:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Your IP address (for testing) or `0.0.0.0/0` (temporary - restrict later)
5. Save rules

### 1.3 Get Connection String

1. In RDS console, note the **Endpoint** (e.g., `transportation-db.xxxxx.us-east-1.rds.amazonaws.com`)
2. Your connection string will be:
   ```
   postgresql://admin:YOUR_PASSWORD@transportation-db.xxxxx.us-east-1.rds.amazonaws.com:5432/transportation
   ```

---

## Step 2: Deploy Backend to AWS Elastic Beanstalk

### 2.1 Prepare Backend

1. **Install PostgreSQL driver** (already done if you followed the setup):
   ```bash
   cd server
   npm install
   ```

2. **Test locally with PostgreSQL** (optional):
   ```bash
   # Set environment variable
   export DATABASE_URL="postgresql://admin:password@localhost:5432/transportation"
   npm run dev
   ```

### 2.2 Create Elastic Beanstalk Application

**Option A: Using AWS Console**

1. Go to AWS Console → Elastic Beanstalk
2. Click "Create application"
3. Fill in:
   - **Application name**: `transportation-api`
   - **Platform**: Node.js
   - **Platform branch**: Node.js 18 running on 64bit Amazon Linux 2023
   - **Application code**: Upload your code
4. Click "Create application"

**Option B: Using EB CLI (Recommended)**

1. Install EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB:
   ```bash
   cd server
   eb init
   # Select your region
   # Select "transportation-api" as application name
   # Select Node.js platform
   ```

3. Create environment:
   ```bash
   eb create transportation-api-prod
   ```

### 2.3 Configure Environment Variables

In Elastic Beanstalk Console → Your environment → Configuration → Software → Environment properties:

```
PORT=8080
NODE_ENV=production
JWT_SECRET=your-very-secure-random-secret-key-min-32-chars
AVIATIONSTACK_API_KEY=your-aviationstack-api-key
DATABASE_URL=postgresql://admin:YOUR_PASSWORD@transportation-db.xxxxx.us-east-1.rds.amazonaws.com:5432/transportation
FRONTEND_URL=https://your-amplify-app.amplifyapp.com
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy

**Using EB CLI:**
```bash
cd server
npm run build
eb deploy
```

**Using Console:**
1. Create a ZIP file of your server directory (excluding node_modules, .env, *.db)
2. Upload via Elastic Beanstalk console

### 2.5 Get Backend URL

After deployment, note your backend URL:
- Example: `http://transportation-api-prod.us-east-1.elasticbeanstalk.com`
- Or: `https://api.yourdomain.com` (if using custom domain)

---

## Step 3: Deploy Frontend to AWS Amplify

### 3.1 Connect Repository

1. Go to AWS Console → Amplify
2. Click "New app" → "Host web app"
3. Choose GitHub
4. Authorize AWS Amplify
5. Select your repository
6. Select branch (usually `main` or `master`)

### 3.2 Configure Build Settings

Amplify should auto-detect `amplify.yml`. If not, use:

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

### 3.3 Set Environment Variables

In Amplify Console → App settings → Environment variables:

```
VITE_API_URL=https://your-elastic-beanstalk-url.elasticbeanstalk.com
```

**Important**: Replace with your actual Elastic Beanstalk URL from Step 2.5

### 3.4 Deploy

1. Click "Save and deploy"
2. Wait for build to complete (5-10 minutes)
3. Note your Amplify URL (e.g., `https://main.xxxxx.amplifyapp.com`)

### 3.5 Update Backend CORS

1. Go back to Elastic Beanstalk
2. Update environment variable:
   ```
   AMPLIFY_URL=https://main.xxxxx.amplifyapp.com
   ```
3. Redeploy backend:
   ```bash
   eb deploy
   ```

---

## Step 4: Verify Deployment

### 4.1 Test Frontend

1. Visit your Amplify URL
2. Try logging in with:
   - Email: `admin@transport.com`
   - Password: `admin123`

### 4.2 Test API

1. Check health endpoint:
   ```
   https://your-backend-url.elasticbeanstalk.com/api/health
   ```

2. Test login:
   ```bash
   curl -X POST https://your-backend-url.elasticbeanstalk.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@transport.com","password":"admin123"}'
   ```

### 4.3 Check Database

1. Connect to RDS using a PostgreSQL client
2. Verify tables were created:
   ```sql
   \dt
   SELECT * FROM drivers;
   ```

---

## Step 5: Security Hardening (Important!)

### 5.1 Restrict RDS Access

1. Update RDS security group to only allow:
   - Your Elastic Beanstalk security group
   - Your IP (for admin access)

### 5.2 Update CORS

In `server/src/index.ts`, update CORS to only allow your Amplify domain.

### 5.3 Enable HTTPS

- Elastic Beanstalk: Configure load balancer with SSL certificate
- Amplify: HTTPS is automatic

### 5.4 Rotate Secrets

Change default admin password and JWT_SECRET after first deployment.

---

## Troubleshooting

### Backend won't start
- Check CloudWatch logs in Elastic Beanstalk
- Verify DATABASE_URL is correct
- Check that RDS security group allows connections

### Frontend can't connect to backend
- Verify VITE_API_URL is set correctly
- Check CORS settings in backend
- Check browser console for errors

### Database connection fails
- Verify DATABASE_URL format
- Check RDS security group rules
- Ensure database is publicly accessible (or use VPC)

### Build fails in Amplify
- Check build logs
- Verify Node.js version compatibility
- Ensure all dependencies are in package.json

---

## Cost Optimization

- Use RDS free tier (12 months)
- Use Elastic Beanstalk free tier
- Use Amplify free tier
- Monitor usage in AWS Cost Explorer

**Estimated monthly cost after free tier**: $15-50/month

---

## Next Steps

1. Set up custom domain
2. Configure CI/CD (automatic with Amplify)
3. Set up monitoring (CloudWatch)
4. Configure backups (RDS automated backups)
5. Set up staging environment

---

## Quick Reference

- **RDS Endpoint**: `transportation-db.xxxxx.us-east-1.rds.amazonaws.com`
- **Backend URL**: `http://transportation-api-prod.us-east-1.elasticbeanstalk.com`
- **Frontend URL**: `https://main.xxxxx.amplifyapp.com`
- **Database Connection**: `postgresql://admin:PASSWORD@ENDPOINT:5432/transportation`
