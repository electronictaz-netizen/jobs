# Complete Deployment Guide - Step by Step

This guide walks you through deploying your Aircrew Transportation Management System from start to finish.

---

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] AWS Account created and signed in
- [ ] GitHub account and repository created
- [ ] AviationStack API key (get from https://aviationstack.com/)
- [ ] Code is working locally
- [ ] All environment variables documented

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Test Local Build

**Test Server Build:**
```bash
cd server
npm install
npm run build
```
✅ Verify: `dist/` folder is created with compiled JavaScript files

**Test Client Build:**
```bash
cd client
npm install
npm run build
```
✅ Verify: `client/dist/` folder is created

### 1.2 Fix Any Build Errors

If you see errors, fix them before proceeding. Common issues:
- Missing dependencies → Run `npm install`
- TypeScript errors → Fix the code
- Missing environment variables → Create `.env` files

### 1.3 Commit and Push to GitHub

```bash
# From project root
git add .
git commit -m "Prepare for AWS deployment"
git push origin main
```

✅ Verify: Code is pushed to GitHub and visible in your repository

---

## Step 2: Set Up AWS RDS PostgreSQL Database

### 2.1 Create RDS Database Instance

1. **Go to AWS Console**
   - Sign in at https://console.aws.amazon.com/
   - Search for "RDS" in the search bar
   - Click "RDS" service

2. **Create Database**
   - Click **"Create database"** button
   - Choose **"Standard create"**

3. **Configure Database**
   - **Engine type**: PostgreSQL
   - **Version**: Latest (e.g., PostgreSQL 15.x)
   - **Template**: Free tier (if eligible) or Production
   
4. **Settings**
   - **DB instance identifier**: `transportation-db`
   - **Master username**: `admin` (or your choice)
   - **Master password**: Create a strong password ⚠️ **SAVE THIS!**
   - **Confirm password**: Re-enter the password

5. **Instance Configuration**
   - **DB instance class**: `db.t3.micro` (free tier) or `db.t3.small`
   - **Storage**: 20 GB (free tier) or as needed
   - **Storage type**: General Purpose SSD (gp3)

6. **Connectivity**
   - **VPC**: Default VPC
   - **Public access**: **Yes** (for now - you can restrict later)
   - **VPC security group**: Create new
   - **Database port**: 5432 (default)
   - **Database name**: `transportation`

7. **Review and Create**
   - Review all settings
   - Click **"Create database"**
   - Wait 5-10 minutes for database to be created

### 2.2 Configure Security Group

1. **Wait for Database to be Available**
   - Status should show "Available" (green)

2. **Get Database Endpoint**
   - Note the **Endpoint** (e.g., `transportation-db.xxxxx.us-east-1.rds.amazonaws.com`)
   - Save this for later!

3. **Configure Security Group**
   - Click on your database instance
   - Go to **"Connectivity & security"** tab
   - Click on the **VPC security group** link
   - Click **"Edit inbound rules"**
   - Click **"Add rule"**
   - Configure:
     - **Type**: PostgreSQL
     - **Protocol**: TCP
     - **Port**: 5432
     - **Source**: `0.0.0.0/0` (for testing - restrict later)
   - Click **"Save rules"**

### 2.3 Create Connection String

Your connection string format:
```
postgresql://admin:YOUR_PASSWORD@transportation-db.xxxxx.us-east-1.rds.amazonaws.com:5432/transportation
```

⚠️ **Important**: 
- Replace `YOUR_PASSWORD` with your actual password
- Replace the endpoint with your actual endpoint
- URL encode special characters in password if needed

✅ **Save this connection string** - you'll need it in Step 4!

---

## Step 3: Deploy Backend to AWS Elastic Beanstalk

### 3.1 Prepare Backend Deployment Package

**Option A: Using PowerShell Script (Windows)**

```powershell
# From project root (C:\Users\ericd\app)
.\server\deploy-console.ps1
```

**Option B: Manual ZIP Creation (Windows)**

```powershell
# Build the code first
cd server
npm install
npm run build
cd ..

# Create ZIP (excluding unnecessary files)
Compress-Archive -Path server\* -DestinationPath server-deploy.zip -Force
```

**Option C: Manual ZIP Creation (Mac/Linux)**

```bash
cd server
npm install
npm run build
cd ..
zip -r server-deploy.zip server/ \
  -x "server/node_modules/*" \
  -x "server/.git/*" \
  -x "server/*.db" \
  -x "server/*.log" \
  -x "server/.env*" \
  -x "server/dist/*"
```

✅ Verify: `server-deploy.zip` file is created

### 3.2 Create Elastic Beanstalk Application

1. **Go to AWS Console**
   - Search for "Elastic Beanstalk"
   - Click "Elastic Beanstalk" service

2. **Create Application**
   - Click **"Create application"** button

3. **Application Details**
   - **Application name**: `transportation-api`
   - **Description**: (optional) "Aircrew Transportation Management API"

4. **Platform Configuration**
   - **Platform**: Node.js
   - **Platform branch**: Node.js 18 running on 64bit Amazon Linux 2023
   - **Platform version**: Latest

5. **Application Code**
   - Select **"Upload your code"**
   - Click **"Choose file"**
   - Select your `server-deploy.zip` file

6. **Create Application**
   - Click **"Create application"**
   - Wait 5-10 minutes for initial deployment
   - Status should show "Healthy" (green)

### 3.3 Configure Environment Variables

1. **Go to Your Environment**
   - Click on your application name
   - Click on the environment (usually named after your app)

2. **Configuration**
   - Click **"Configuration"** in left sidebar
   - Find **"Software"** section
   - Click **"Edit"** button

3. **Add Environment Properties**
   Scroll down to **"Environment properties"** and add:

   ```
   DATABASE_URL=postgresql://admin:YOUR_PASSWORD@transportation-db.xxxxx.us-east-1.rds.amazonaws.com:5432/transportation
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your-secure-jwt-secret-here
   AVIATIONSTACK_API_KEY=your-aviationstack-api-key
   FRONTEND_URL=https://your-amplify-url.amplifyapp.com
   AMPLIFY_URL=https://your-amplify-url.amplifyapp.com
   ```

   ⚠️ **Important Notes:**
   - Replace `DATABASE_URL` with your actual connection string from Step 2.3
   - Generate `JWT_SECRET` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Add your actual `AVIATIONSTACK_API_KEY`
   - Leave `FRONTEND_URL` and `AMPLIFY_URL` empty for now (update after frontend deployment)

4. **Apply Changes**
   - Click **"Apply"** button
   - Wait 2-5 minutes for environment to update

### 3.4 Get Backend URL

1. **After deployment completes**
   - Your backend URL is displayed at the top
   - Example: `http://transportation-api.us-east-1.elasticbeanstalk.com`
   - Or: `https://transportation-api.us-east-1.elasticbeanstalk.com`

2. **Test Health Endpoint**
   - Open browser and go to: `https://your-backend-url.elasticbeanstalk.com/api/health`
   - Should return: `{"status":"ok"}`

✅ **Save your backend URL** - you'll need it in Step 4!

### 3.5 Update Security Group (Backend to Database)

1. **Get Backend Security Group**
   - Go to Elastic Beanstalk → Your environment → Configuration
   - Scroll to "Instances" section
   - Note the Security group name

2. **Update Database Security Group**
   - Go to RDS → Your database → Connectivity & security
   - Click on VPC security group
   - Edit inbound rules
   - Add rule:
     - **Type**: PostgreSQL
     - **Port**: 5432
     - **Source**: Select the Elastic Beanstalk security group (more secure) OR use `0.0.0.0/0` for testing
   - Save rules

---

## Step 4: Deploy Frontend to AWS Amplify

### 4.1 Connect GitHub Repository

1. **Go to AWS Console**
   - Search for "Amplify"
   - Click "AWS Amplify" service

2. **Create New App**
   - Click **"New app"** → **"Host web app"**

3. **Connect Repository**
   - Choose **"GitHub"**
   - Click **"Authorize AWS Amplify"** (if first time)
   - Authorize AWS Amplify to access your GitHub

4. **Select Repository**
   - Choose your repository
   - Select branch: `main` (or `master`)
   - Click **"Next"**

### 4.2 Configure Build Settings

Amplify should auto-detect `amplify.yml`. Verify the build settings:

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
        - cd client && npm run build
  artifacts:
    baseDirectory: client/dist
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
```

If it doesn't auto-detect, paste the above YAML.

Click **"Next"**

### 4.3 Set Environment Variables

1. **Environment Variables Section**
   - Click **"Advanced settings"** or scroll to environment variables

2. **Add Environment Variable**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.elasticbeanstalk.com`
     - Use the backend URL from Step 3.4
     - Include `https://` (or `http://` if HTTPS not available)
     - NO trailing slash

3. **Review and Deploy**
   - Click **"Save and deploy"**
   - Wait 5-10 minutes for build and deployment

### 4.4 Get Frontend URL

1. **After Deployment Completes**
   - Your Amplify URL is displayed
   - Example: `https://main.d1234567890.amplifyapp.com`

2. **Test Frontend**
   - Open the URL in your browser
   - You should see the login page

✅ **Save your Amplify URL** - you'll need it next!

---

## Step 5: Update Backend CORS Configuration

### 5.1 Update Backend Environment Variables

1. **Go Back to Elastic Beanstalk**
   - Navigate to your environment
   - Configuration → Software → Edit

2. **Update Environment Variables**
   - Update `FRONTEND_URL` with your Amplify URL
   - Update `AMPLIFY_URL` with your Amplify URL
   - Example:
     ```
     FRONTEND_URL=https://main.d1234567890.amplifyapp.com
     AMPLIFY_URL=https://main.d1234567890.amplifyapp.com
     ```

3. **Apply Changes**
   - Click "Apply"
   - Wait for environment to update

### 5.2 (Optional) Redeploy Backend

If CORS changes don't take effect, you may need to redeploy:

1. **Create New Deployment Package**
   - Follow Step 3.1 again

2. **Upload and Deploy**
   - Elastic Beanstalk → Your environment
   - Click **"Upload and deploy"**
   - Upload your ZIP file
   - Add version label
   - Click **"Deploy"**

---

## Step 6: Verify Deployment

### 6.1 Test Backend

1. **Health Check**
   ```
   https://your-backend-url.elasticbeanstalk.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Login Endpoint** (optional)
   ```bash
   curl -X POST https://your-backend-url.elasticbeanstalk.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@transport.com","password":"admin123"}'
   ```

### 6.2 Test Frontend

1. **Open Amplify URL**
   - Go to your Amplify URL in browser
   - You should see the login page

2. **Test Login**
   - Email: `admin@transport.com`
   - Password: `admin123`
   - Click "Login"
   - Should redirect to dashboard

3. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab - API calls should succeed

### 6.3 Test Full Functionality

1. **Create a Job**
   - Navigate to Management Dashboard
   - Create a new transportation job
   - Verify it saves

2. **Test Flight Status** (if configured)
   - Add a flight number to a job
   - Check if flight status displays

---

## Step 7: Troubleshooting

### Backend Issues

**Environment not healthy:**
- Check CloudWatch logs: Elastic Beanstalk → Logs → Request Logs
- Verify all environment variables are set correctly
- Check DATABASE_URL format

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check RDS security group allows connections from Elastic Beanstalk
- Verify database is "Available" in RDS console

**Application won't start:**
- Check logs for specific errors
- Verify PORT is set to 8080
- Check that TypeScript compiled successfully (dist/ folder exists)

### Frontend Issues

**Build fails:**
- Check build logs in Amplify console
- Verify `amplify.yml` is correct
- Test build locally: `cd client && npm run build`

**API calls fail:**
- Verify `VITE_API_URL` is set correctly in Amplify
- Check browser console for CORS errors
- Verify backend is running and accessible
- Check backend CORS configuration

**404 errors:**
- Verify backend URL in `VITE_API_URL`
- Check backend health endpoint
- Verify routes are correct

---

## Quick Reference: All URLs and Keys

Create a document with:

```
Backend URL: https://your-backend.elasticbeanstalk.com
Frontend URL: https://your-app.amplifyapp.com

Database Endpoint: transportation-db.xxxxx.us-east-1.rds.amazonaws.com
Database Connection: postgresql://admin:****@endpoint:5432/transportation

JWT_SECRET: (your secret)
AVIATIONSTACK_API_KEY: (your key)
```

---

## Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerts
- [ ] Configure database backups
- [ ] Tighten security (restrict RDS access, use VPC)
- [ ] Set up CI/CD for automatic deployments

---

## Summary Checklist

- [ ] Code tested and built locally
- [ ] Code pushed to GitHub
- [ ] RDS PostgreSQL database created and configured
- [ ] Backend deployed to Elastic Beanstalk
- [ ] Backend environment variables configured
- [ ] Backend URL obtained and tested
- [ ] Frontend deployed to Amplify
- [ ] Frontend environment variables configured
- [ ] Frontend URL obtained
- [ ] Backend CORS updated with frontend URL
- [ ] Full functionality tested
- [ ] All URLs and keys documented

---

**Congratulations! Your application is now deployed to AWS! 🎉**
