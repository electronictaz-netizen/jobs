# Elastic Beanstalk Deployment - Quick Guide

## If `eb init` is not working

**Use the AWS Console method instead!** It's actually easier and doesn't require installing anything.

## Quick Deployment Steps

### 1. Build and Create ZIP

**Windows:**
```powershell
# Run this script from the server directory
.\deploy-console.ps1
```

**Mac/Linux:**
```bash
# Make executable first
chmod +x deploy-console.sh
# Then run
./deploy-console.sh
```

**Or manually:**
```powershell
# Windows PowerShell
cd server
npm run build
cd ..
Compress-Archive -Path server/* -DestinationPath server-deploy.zip -Exclude node_modules,*.db,*.log,.env*
```

```bash
# Mac/Linux
cd server
npm run build
cd ..
zip -r server-deploy.zip server/ -x "server/node_modules/*" "server/.git/*" "server/*.db" "server/*.log" "server/.env*"
```

### 2. Deploy via AWS Console

1. Go to **AWS Console → Elastic Beanstalk**
2. Click **"Create application"**
3. Fill in:
   - Application name: `transportation-api`
   - Platform: **Node.js**
   - Platform branch: **Node.js 18 running on 64bit Amazon Linux 2023**
   - Application code: **Upload your code**
   - Click **"Choose file"** and select `server-deploy.zip`
4. Click **"Create application"**
5. Wait 5-10 minutes

### 3. Configure Environment Variables

After deployment, go to:
- Configuration → Software → Edit
- Scroll to "Environment properties"
- Add all required variables (see DEPLOYMENT_STEPS.md)
- Click "Apply"

### 4. Update/Re-deploy

When you make changes:
1. Run the deploy script again to create a new ZIP
2. Go to your environment
3. Click "Upload and deploy"
4. Upload the new ZIP file

---

## Installing EB CLI (Optional)

If you want to use EB CLI later:

**Windows:**
1. Install Python 3.7+ from python.org
2. Open PowerShell as Administrator
3. Run: `pip install awsebcli`
4. Configure AWS: `aws configure`

**Mac/Linux:**
```bash
pip3 install awsebcli --user
export PATH=$PATH:~/.local/bin
aws configure
```

But honestly, the Console method is simpler! 🎉
