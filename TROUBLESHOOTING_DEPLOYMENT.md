# AWS Deployment Failure Troubleshooting

## Quick Diagnostic Questions

1. **Which deployment is failing?**
   - [ ] Elastic Beanstalk (Backend)
   - [ ] AWS Amplify (Frontend)
   - [ ] Both

2. **What's the error message?**
   - Check CloudWatch logs (Elastic Beanstalk)
   - Check build logs (Amplify)
   - Copy the exact error message

3. **At what stage does it fail?**
   - [ ] Building/compiling
   - [ ] Starting application
   - [ ] Health checks
   - [ ] Database connection
   - [ ] Other

---

## Common Issues and Solutions

### Elastic Beanstalk Backend Issues

#### Issue 1: Application won't start

**Symptoms:**
- Environment shows "Severe" or "Warning"
- Health checks failing
- Application not responding

**Check CloudWatch Logs:**
1. Go to Elastic Beanstalk → Your environment
2. Click "Logs" → "Request Logs" → "Last 100 Lines"
3. Look for error messages

**Common Causes:**
- Missing environment variables (especially DATABASE_URL)
- Port configuration (should be 8080)
- TypeScript not compiled (missing dist/ folder)
- Database connection failure

**Solutions:**

1. **Verify environment variables are set:**
   - Configuration → Software → Environment properties
   - Must include: DATABASE_URL, JWT_SECRET, NODE_ENV, PORT

2. **Check if code is built:**
   - If uploading source, make sure `src/` is included
   - Elastic Beanstalk will run `npm install` and `npm run build`
   - Or upload pre-built `dist/` folder

3. **Verify PORT is set:**
   ```javascript
   // In server/src/index.ts
   const PORT = process.env.PORT || 3001; // Should use 8080 in EB
   ```

4. **Check database connection:**
   - Verify DATABASE_URL format
   - Check RDS security group allows connections
   - Test connection locally first

#### Issue 2: Build/Compile errors

**Symptoms:**
- Deployment fails during build phase
- TypeScript errors
- Missing dependencies

**Solutions:**

1. **Test build locally first:**
   ```bash
   cd server
   npm install
   npm run build
   ```
   Fix any local errors first!

2. **Include all source files:**
   - Make sure `src/` directory is in ZIP
   - Include `tsconfig.json`
   - Include `package.json` and `package-lock.json`

3. **Check package.json scripts:**
   ```json
   "scripts": {
     "build": "tsc",
     "start": "node dist/index.js"
   }
   ```

#### Issue 3: Database connection errors

**Symptoms:**
- "Connection refused"
- "Authentication failed"
- Timeout errors

**Solutions:**

1. **Verify DATABASE_URL format:**
   ```
   postgresql://username:password@host:5432/database
   ```
   - No spaces
   - URL encode special characters in password
   - Correct port (5432)

2. **Check RDS security group:**
   - Inbound rule: PostgreSQL (port 5432)
   - Source: Elastic Beanstalk security group or 0.0.0.0/0 (for testing)

3. **Verify database is running:**
   - Check RDS console - status should be "Available"
   - Note the endpoint URL

4. **Test connection:**
   ```bash
   # Install psql or use a database client
   psql "postgresql://user:pass@host:5432/dbname"
   ```

#### Issue 4: Module not found errors

**Symptoms:**
- "Cannot find module 'pg'"
- "Cannot find module 'xxx'"

**Solutions:**

1. **Make sure package.json includes all dependencies:**
   ```bash
   cd server
   npm install --save pg
   npm install --save-dev @types/pg
   ```

2. **Verify node_modules is NOT in ZIP:**
   - Elastic Beanstalk installs dependencies automatically
   - Exclude node_modules from deployment ZIP

3. **Check package.json dependencies section:**
   - All production dependencies should be listed
   - DevDependencies are not installed in production

#### Issue 5: Health check failures

**Symptoms:**
- Environment shows "Warning" or "Degraded"
- Health endpoint returns errors

**Solutions:**

1. **Verify health endpoint works:**
   ```bash
   curl https://your-app.elasticbeanstalk.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Check application is listening on correct port:**
   - Elastic Beanstalk uses port 8080
   - Verify: `const PORT = process.env.PORT || 3001;`

3. **Check CORS if calling from browser:**
   - Verify CORS allows your domain

---

### AWS Amplify Frontend Issues

#### Issue 1: Build fails

**Symptoms:**
- Build fails in Amplify console
- TypeScript errors
- Missing dependencies

**Check Build Logs:**
1. Amplify Console → Your app → Build history
2. Click on failed build
3. Check build logs

**Solutions:**

1. **Test build locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Verify amplify.yml:**
   - Should build from `client/` directory
   - Output should be `client/dist`

3. **Check environment variables:**
   - VITE_API_URL should be set
   - No trailing slash

#### Issue 2: API calls failing

**Symptoms:**
- Frontend loads but API calls fail
- CORS errors in browser console
- 404 errors

**Solutions:**

1. **Verify VITE_API_URL:**
   - Should be full URL: `https://your-backend.elasticbeanstalk.com`
   - No trailing slash
   - HTTP/HTTPS correct

2. **Check CORS in backend:**
   - Backend CORS must allow Amplify domain
   - Check browser console for CORS errors

3. **Verify backend is running:**
   - Test backend health endpoint
   - Check Elastic Beanstalk environment status

---

## Step-by-Step Debugging

### For Elastic Beanstalk:

1. **Check Environment Status:**
   - Go to Elastic Beanstalk → Your environment
   - Check health status (should be green/OK)

2. **View Recent Events:**
   - Look at "Recent Events" tab
   - Check for errors (red entries)

3. **Check Logs:**
   - Click "Logs" → "Request Logs" → "Last 100 Lines"
   - Or "Full Logs" for more details
   - Look for error messages

4. **Test Health Endpoint:**
   ```bash
   curl http://your-app.elasticbeanstalk.com/api/health
   ```

5. **Verify Environment Variables:**
   - Configuration → Software → Environment properties
   - All required variables should be set

6. **Check Database Connection:**
   - Verify DATABASE_URL is correct
   - Test RDS connection from your local machine
   - Check security groups

### For Amplify:

1. **Check Build Logs:**
   - Amplify Console → Build history
   - Click on build to see logs
   - Look for errors (usually in red)

2. **Test Local Build:**
   ```bash
   cd client
   npm install
   npm run build
   ```

3. **Check Environment Variables:**
   - App settings → Environment variables
   - VITE_API_URL should be set

4. **Test in Browser:**
   - Open browser console (F12)
   - Check for errors
   - Check Network tab for failed requests

---

## Getting Help

When asking for help, provide:

1. **Which service:** Elastic Beanstalk or Amplify
2. **Error messages:** Copy exact error text
3. **Logs:** Relevant log excerpts
4. **What you've tried:** Steps already taken
5. **Environment:** Windows/Mac/Linux, Node version

---

## Quick Fixes Checklist

**Elastic Beanstalk:**
- [ ] All environment variables set
- [ ] DATABASE_URL format correct
- [ ] RDS security group allows connections
- [ ] PORT environment variable set to 8080
- [ ] Source files (src/) included in ZIP
- [ ] package.json includes all dependencies
- [ ] Test build works locally

**Amplify:**
- [ ] VITE_API_URL environment variable set
- [ ] Build works locally (`npm run build`)
- [ ] amplify.yml configuration correct
- [ ] Backend is running and accessible
- [ ] CORS configured correctly
