# Quick Start Deployment Checklist

Use this checklist to quickly deploy your application to AWS.

## Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] All environment variables documented
- [ ] AviationStack API key ready

## Step 1: Database Setup (15 minutes)

- [ ] Create AWS RDS PostgreSQL instance
- [ ] Note database endpoint URL
- [ ] Configure security group (allow port 5432)
- [ ] Test connection locally (optional)

**Connection String Format:**
```
postgresql://username:password@endpoint:5432/database_name
```

## Step 2: Backend Deployment (20 minutes)

- [ ] Install PostgreSQL driver: `cd server && npm install`
- [ ] Create Elastic Beanstalk application
- [ ] Set environment variables:
  - `DATABASE_URL` (from Step 1)
  - `JWT_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - `AVIATIONSTACK_API_KEY`
  - `NODE_ENV=production`
  - `PORT=8080`
- [ ] Deploy backend
- [ ] Note backend URL

## Step 3: Frontend Deployment (10 minutes)

- [ ] Go to AWS Amplify Console
- [ ] Connect GitHub repository
- [ ] Set environment variable: `VITE_API_URL` (your backend URL from Step 2)
- [ ] Deploy
- [ ] Note Amplify URL

## Step 4: Final Configuration (5 minutes)

- [ ] Update backend CORS with Amplify URL
- [ ] Test login at Amplify URL
- [ ] Verify API connectivity

## Environment Variables Summary

### Backend (Elastic Beanstalk)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
AVIATIONSTACK_API_KEY=your-key
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-amplify-url.amplifyapp.com
```

### Frontend (Amplify)
```
VITE_API_URL=https://your-backend-url.elasticbeanstalk.com
```

## Troubleshooting

**Backend won't start?**
- Check CloudWatch logs
- Verify DATABASE_URL format
- Check RDS security group

**Frontend can't connect?**
- Verify VITE_API_URL is set
- Check browser console for CORS errors
- Verify backend is running

**Database connection fails?**
- Check DATABASE_URL format
- Verify security group allows connections
- Test connection with psql client

## Next Steps

- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Tighten security (restrict RDS access)
