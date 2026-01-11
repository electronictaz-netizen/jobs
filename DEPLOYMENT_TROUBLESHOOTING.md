# Deployment Troubleshooting Guide

## Common Issues and Solutions

### Issue: `eb init` command not found

**Solution**: Use the AWS Console method instead (recommended!)

1. You don't need EB CLI to deploy
2. Use the AWS Console → Elastic Beanstalk → Upload and deploy
3. See `DEPLOYMENT_BEANSTALK.md` for step-by-step instructions

**If you really want EB CLI:**
- Windows: Install Python, then `pip install awsebcli`
- Mac/Linux: `pip3 install awsebcli --user`
- Then configure: `aws configure`

---

### Issue: Build fails in Elastic Beanstalk

**Check:**
1. Make sure you're uploading source files, not just `dist/`
2. Elastic Beanstalk needs to run `npm install` and `npm run build`
3. Make sure `package.json` is in your ZIP
4. Check CloudWatch logs for specific errors

**Solution:**
- Include `src/` directory in your ZIP
- Include `tsconfig.json` in your ZIP
- Elastic Beanstalk will build automatically if you include source files

---

### Issue: Database connection fails

**Check:**
1. DATABASE_URL format: `postgresql://user:pass@host:5432/dbname`
2. RDS security group allows connections from Elastic Beanstalk
3. Database is publicly accessible (or use VPC)

**Solution:**
- Verify DATABASE_URL in environment variables
- Check RDS security group inbound rules
- Test connection locally with `psql` or database client

---

### Issue: Frontend can't connect to backend

**Check:**
1. VITE_API_URL is set correctly in Amplify
2. Backend CORS allows your Amplify domain
3. Backend is running and accessible

**Solution:**
- Verify VITE_API_URL: `https://your-backend.elasticbeanstalk.com`
- Check backend CORS configuration
- Test backend health endpoint: `https://your-backend.elasticbeanstalk.com/api/health`

---

### Issue: ZIP file is too large

**Solution:**
- Exclude `node_modules/` (Elastic Beanstalk will install)
- Exclude `.git/`, `*.db`, `*.log`, `.env*`
- Use the provided deploy scripts

---

### Issue: Environment variables not working

**Check:**
1. Variables are set in Elastic Beanstalk Configuration
2. No typos in variable names
3. Applied the configuration changes

**Solution:**
- Go to Configuration → Software → Environment properties
- Add variables one by one
- Click "Apply" and wait for update

---

### Issue: TypeScript not compiling

**Check:**
1. `tsconfig.json` is in ZIP
2. `package.json` has build script
3. Source files are included

**Solution:**
- Make sure `src/` directory is in ZIP
- Verify `npm run build` works locally first
- Check CloudWatch logs for build errors

---

### Issue: Port issues

**Solution:**
- Elastic Beanstalk uses port 8080 (set PORT=8080)
- Make sure your code uses `process.env.PORT || 3001`

---

## Still having issues?

1. Check CloudWatch logs in Elastic Beanstalk
2. Test locally first with production environment variables
3. Verify all environment variables are set correctly
4. Check AWS service quotas/limits
5. Review the detailed guides:
   - `DEPLOYMENT_STEPS.md` - Full step-by-step guide
   - `DEPLOYMENT_BEANSTALK.md` - Console deployment method
   - `QUICK_START.md` - Quick checklist
