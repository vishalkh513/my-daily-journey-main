# Vercel Deployment Guide

This app is configured for Vercel deployment with serverless functions for the backend API.

## Prerequisites

1. Vercel Account: https://vercel.com
2. GitHub Repository with this code
3. MongoDB Atlas Connection String

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the project from the list
4. Click "Import"

### 3. Set Environment Variables
In Vercel Project Settings → Environment Variables, add:

```
VITE_MONGODB_URI=mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test
```

### 4. Configure Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: `20.x` (recommended)

### 5. Deploy
Click "Deploy" button. Vercel will:
1. Build the React frontend (Vite)
2. Deploy API serverless functions from `/api` folder
3. Serve the static frontend

## API Endpoints on Vercel

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/marks?userId=...` - Get marks for user
- `POST /api/marks` - Create mark

## Frontend API Configuration

The frontend automatically uses:
- Local: `http://localhost:3000/api` (development)
- Production: `https://your-project.vercel.app/api`

## Troubleshooting

### Build Fails
- Check Node version (should be 20.x)
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`

### API Not Working
- Verify environment variables are set
- Check Vercel Function logs in dashboard
- Ensure MongoDB connection string is correct
- Check CORS is properly configured

### Database Connection Issues
- Verify MongoDB connection string in Environment Variables
- Ensure MongoDB Atlas IP whitelist includes Vercel's IPs (or use 0.0.0.0)
- Check MongoDB Atlas credentials are correct

## Local Testing Before Deployment

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Test API locally
npm run dev:server  # In another terminal
```

## Important Files for Deployment

- `vercel.json` - Vercel configuration
- `api/` - Serverless API functions
- `.env.example` - Environment variable template
- `.vercelignore` - Files to exclude from deployment
- `dist/` - Built frontend (generated during build)

## Monitoring

Monitor your deployment at:
- Vercel Dashboard: https://vercel.com/dashboard
- Function Logs: Project → Functions → View Logs
- Build Logs: Project → Deployments → Select Deployment → Build Logs

## Production Checklist

- [ ] MongoDB Atlas IP whitelist updated
- [ ] Environment variables set in Vercel
- [ ] Build command correct
- [ ] Output directory is `dist`
- [ ] Node version is 20.x
- [ ] All API endpoints tested
- [ ] Frontend builds without errors
- [ ] CORS configured properly

## Next Steps

1. Update frontend API URLs if not using default
2. Set up custom domain (optional)
3. Configure CI/CD for automatic deployments
4. Set up monitoring and alerts
5. Implement proper error logging

For more help: https://vercel.com/docs
