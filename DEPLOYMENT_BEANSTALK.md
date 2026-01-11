# Elastic Beanstalk Deployment Guide (Console Method)

Since the EB CLI might not be installed, here's how to deploy using the AWS Console instead.

## Method 1: Deploy via AWS Console (Recommended if EB CLI not working)

### Step 1: Prepare Your Code

1. **Build your TypeScript code:**
   ```bash
   cd server
   npm install
   npm run build
   ```

2. **Create a deployment ZIP file:**
   
   **On Windows (PowerShell):**
   ```powershell
   # Make sure you're in the server directory
   cd server
   
   # Create ZIP excluding node_modules, .env, and database files
   Compress-Archive -Path * -DestinationPath ../server-deploy.zip -Exclude node_modules,*.db,*.log,.env*
   ```
   
   **On Mac/Linux:**
   ```bash
   cd server
   zip -r ../server-deploy.zip . -x "node_modules/*" ".git/*" "*.db" "*.log" ".env*" "dist/*"
   ```

   **Important files to include:**
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `src/` directory (source files)
   - `migrations/` directory
   - `dist/` directory (if you built it)
   - `.platform/` directory (if using hooks)

### Step 2: Create Elastic Beanstalk Application

1. Go to AWS Console → **Elastic Beanstalk**
2. Click **"Create application"**
3. Fill in the form:
   - **Application name**: `transportation-api`
   - **Platform**: Node.js
   - **Platform branch**: Node.js 18 running on 64bit Amazon Linux 2023
   - **Platform version**: Latest
   - **Application code**: Choose **"Upload your code"**
   - Click **"Choose file"** and select your `server-deploy.zip`
4. Click **"Create application"**

### Step 3: Wait for Initial Deployment

- This will take 5-10 minutes
- Wait for the environment to be "Healthy" (green checkmark)

### Step 4: Configure Environment Variables

1. Go to your environment → **Configuration**
2. Click **"Edit"** in the Software section
3. Scroll down to **"Environment properties"**
4. Add these variables:

```
NODE_ENV=production
PORT=8080
JWT_SECRET=<generate-a-secure-random-string>
DATABASE_URL=postgresql://admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/transportation
AVIATIONSTACK_API_KEY=your-aviationstack-api-key
FRONTEND_URL=https://your-amplify-url.amplifyapp.com
AMPLIFY_URL=https://your-amplify-url.amplifyapp.com
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Click **"Apply"**
6. Wait for the environment to update (2-5 minutes)

### Step 5: Configure Build Process

Since we're uploading source code, we need to tell Elastic Beanstalk to build it.

1. Go to Configuration → Software → Edit
2. Add a build command in "Commands":
   - **Command**: `npm install && npm run build`
   - **Leader only**: Yes
3. Or create a `.platform/hooks/prebuild/01_build.sh` file:

```bash
#!/bin/bash
cd /var/app/staging
npm install
npm run build
```

### Step 6: Update Platform Hooks (if needed)

Create a file in your server directory: `.platform/hooks/prebuild/01_build.sh`

```bash
#!/bin/bash
cd /var/app/staging
npm install
npm run build
```

Then recreate your ZIP with this file included.

### Step 7: Redeploy

1. Go to your environment
2. Click **"Upload and deploy"**
3. Upload your updated ZIP file
4. Add a version label (e.g., "v1.0.0")
5. Click **"Deploy"**

---

## Method 2: Install EB CLI (Alternative)

If you want to use EB CLI, here's how to install it:

### Windows

1. Install Python 3.7+ from python.org
2. Open PowerShell as Administrator
3. Install EB CLI:
   ```powershell
   pip install awsebcli
   ```
4. Verify installation:
   ```powershell
   eb --version
   ```
5. Configure AWS credentials:
   ```powershell
   aws configure
   ```
   You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)
   - Default output format (json)

### Mac/Linux

```bash
# Install Python and pip if needed
# Then:
pip3 install awsebcli --user

# Add to PATH (add to ~/.bashrc or ~/.zshrc):
export PATH=$PATH:~/.local/bin

# Verify
eb --version
```

### Then Initialize:

```bash
cd server
eb init

# Follow the prompts:
# - Select region
# - Select application (or create new)
# - Select platform: Node.js
# - Select platform version
# - Setup SSH? (optional)
```

---

## Method 3: Use AWS App Runner (Easier, but different approach)

App Runner is simpler but requires a Dockerfile (which we've created):

1. Go to AWS App Runner
2. Create service
3. Source: GitHub (connect repository)
4. Build settings: Use Dockerfile
5. Configure environment variables
6. Deploy

This method uses the `server/Dockerfile` we created.

---

## Troubleshooting EB CLI Issues

### "eb: command not found"
- EB CLI is not installed or not in PATH
- Use Console method (Method 1) instead

### "Unable to locate credentials"
- Run `aws configure` to set up credentials
- Or set environment variables:
  ```bash
  export AWS_ACCESS_KEY_ID=your-key
  export AWS_SECRET_ACCESS_KEY=your-secret
  export AWS_DEFAULT_REGION=us-east-1
  ```

### "Application already exists"
- Either use the existing application or choose a different name
- You can manage applications in the EB Console

---

## Recommended: Use Console Method

For simplicity, I recommend using **Method 1 (Console)** since:
- No CLI installation needed
- Works on any operating system
- Easier to see what's happening
- Better error messages

The only downside is you need to manually create ZIP files for updates, but that's straightforward.
