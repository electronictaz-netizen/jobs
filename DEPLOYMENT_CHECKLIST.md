# Deployment Checklist - Quick Reference

Use this checklist to track your deployment progress.

## Pre-Deployment

- [ ] Code works locally
- [ ] Server builds successfully: `cd server && npm run build`
- [ ] Client builds successfully: `cd client && npm run build`
- [ ] All changes committed to git
- [ ] Code pushed to GitHub
- [ ] AviationStack API key ready
- [ ] AWS account created and signed in

---

## Step 1: Database Setup

- [ ] RDS PostgreSQL instance created
- [ ] Database endpoint saved
- [ ] Database password saved securely
- [ ] Security group configured (port 5432)
- [ ] Database status: "Available"
- [ ] Connection string created and saved

**Connection String Format:**
```
postgresql://admin:PASSWORD@endpoint:5432/transportation
```

---

## Step 2: Backend Deployment

- [ ] Deployment ZIP file created
- [ ] Elastic Beanstalk application created
- [ ] Backend deployed successfully
- [ ] Environment status: "Healthy"
- [ ] Environment variables configured:
  - [ ] DATABASE_URL
  - [ ] NODE_ENV=production
  - [ ] PORT=8080
  - [ ] JWT_SECRET (generated)
  - [ ] AVIATIONSTACK_API_KEY
- [ ] Backend URL obtained: `https://________.elasticbeanstalk.com`
- [ ] Health endpoint tested: `/api/health` returns `{"status":"ok"}`
- [ ] Database security group updated (allow EB access)

---

## Step 3: Frontend Deployment

- [ ] GitHub repository connected to Amplify
- [ ] Build settings configured (amplify.yml detected)
- [ ] Environment variable set: `VITE_API_URL=https://your-backend.elasticbeanstalk.com`
- [ ] Frontend deployed successfully
- [ ] Frontend URL obtained: `https://________.amplifyapp.com`
- [ ] Frontend loads in browser

---

## Step 4: Configuration

- [ ] Backend CORS updated with Amplify URL
- [ ] Backend environment variables updated:
  - [ ] FRONTEND_URL
  - [ ] AMPLIFY_URL
- [ ] Backend redeployed (if needed)

---

## Step 5: Testing

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Login page displays
- [ ] Can log in with admin credentials
- [ ] Dashboard loads after login
- [ ] Can create/view jobs
- [ ] API calls work (check browser console)
- [ ] No CORS errors in browser console
- [ ] No 404 errors

---

## Important Information to Save

**Backend:**
- URL: ________________________________
- Environment name: ________________________________

**Frontend:**
- URL: ________________________________
- App ID: ________________________________

**Database:**
- Endpoint: ________________________________
- Username: ________________________________
- Database name: ________________________________
- Connection string: ________________________________

**Secrets:**
- JWT_SECRET: ________________________________
- AVIATIONSTACK_API_KEY: ________________________________

---

## Troubleshooting Quick Reference

**Backend not healthy:**
1. Check CloudWatch logs
2. Verify environment variables
3. Check DATABASE_URL format
4. Verify database is accessible

**Frontend build fails:**
1. Check build logs in Amplify
2. Verify amplify.yml is correct
3. Test build locally
4. Check for TypeScript errors

**API calls fail:**
1. Verify VITE_API_URL is set
2. Check backend is running
3. Check CORS configuration
4. Check browser console for errors

---

## Post-Deployment

- [ ] Document all URLs and credentials securely
- [ ] Set up monitoring/alerts
- [ ] Configure database backups
- [ ] Review security settings
- [ ] Plan for custom domain (optional)
- [ ] Set up CI/CD (optional)
