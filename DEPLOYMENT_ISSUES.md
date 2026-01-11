# AWS Deployment Failure - Quick Diagnostic Guide

## What error are you seeing?

Please check and provide:

### For Elastic Beanstalk (Backend):

1. **Go to AWS Console → Elastic Beanstalk → Your Environment**
2. **Check "Recent Events"** - What errors are shown?
3. **Check Logs:**
   - Click "Logs" → "Request Logs" → "Last 100 Lines"
   - Or "Full Logs" for complete error details
   - Copy any error messages you see

### For Amplify (Frontend):

1. **Go to AWS Amplify Console → Your App**
2. **Click "Build history"**
3. **Click on the failed build**
4. **Scroll through logs** - What errors are shown?
5. **Copy error messages**

---

## Common Issues - Quick Fixes

### Issue: "Cannot find module" errors

**Solution:**
- Make sure `package.json` includes all dependencies
- Run `cd server && npm install` locally to update package-lock.json
- Make sure node_modules is NOT in your ZIP file

### Issue: Database connection fails

**Check:**
- DATABASE_URL environment variable is set correctly
- Format: `postgresql://username:password@host:5432/database`
- RDS security group allows connections from Elastic Beanstalk
- Database is running and accessible

### Issue: Application won't start

**Check:**
- PORT environment variable set to 8080
- All required environment variables are set
- Check CloudWatch logs for specific errors

### Issue: TypeScript/build errors

**Solution:**
1. Test build locally first:
   ```bash
   cd server
   npm install
   npm run build
   ```
2. Fix any local errors before deploying
3. Make sure `src/` directory is in your ZIP file

### Issue: Health check fails

**Check:**
- Application is listening on port 8080
- `/api/health` endpoint is accessible
- Database connection is working

---

## Need More Help?

Please provide:
1. **Which service**: Elastic Beanstalk or Amplify
2. **Error message**: Copy the exact text
3. **When it fails**: During build, startup, or runtime
4. **Logs**: Relevant log excerpts

Then we can provide specific solutions!
