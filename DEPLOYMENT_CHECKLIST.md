# VERCEL DEPLOYMENT CHECKLIST

## Pre-Deployment Verification

### ✅ Code & Configuration Files
- [x] vercel.json - Configured with build settings
- [x] .vercelignore - Excludes unnecessary files  
- [x] package.json - Has correct build script
- [x] tsconfig.json - Valid TypeScript config
- [x] vite.config.ts - Vite build configured
- [x] .env.example - Documents VITE_MONGODB_URI

### ✅ Frontend
- [x] src/main.tsx - React app entry point
- [x] src/App.tsx - Main app component
- [x] src/pages/ - All pages implemented
- [x] src/components/ - UI components ready
- [x] Vite build working locally: `npm run build`

### ✅ API Functions (Serverless)
- [x] api/index.ts - Health check endpoint
- [x] api/auth/signup.ts - User registration
- [x] api/auth/signin.ts - User login
- [x] api/posts/index.ts - GET all posts, POST create
- [x] api/posts/[id].ts - GET/PUT/DELETE single post
- [x] api/marks/index.ts - GET marks, POST create
- [x] api/marks/[id].ts - PUT/DELETE marks
- All functions have CORS headers
- All functions use MongoDB connection pooling

### ✅ Database
- [x] MongoDB Atlas cluster configured
- [x] Connection string: mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test
- [x] Network access allows all IPs (0.0.0.0/0)
- [x] Collections: users, credentials, posts, marks

### ✅ Environment Variables (To Set in Vercel)
- VITE_MONGODB_URI = mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test

### ✅ Local Testing (Already Verified)
- [x] Blog POST works - Creates posts in DB
- [x] Blog GET all - Returns all posts
- [x] Blog GET single - Fetches by :postId
- [x] Blog PUT - Updates post with auth check
- [x] Blog DELETE - Removes post with auth check
- [x] Frontend renders correctly
- [x] User signup/signin working
- [x] Post creation from UI working

## VERCEL SETUP INSTRUCTIONS

### Step 1: Connect to Vercel
```
1. Go to https://vercel.com
2. Sign in / Create account
3. Click "Add New" → "Project"
4. Select: "Import Git Repository"
5. Connect GitHub repo: https://github.com/vishalkh513/my-daily-journey-main
6. Select repository, click "Import"
```

### Step 2: Project Settings
```
- Framework: Vite
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install
```

### Step 3: Environment Variables (IMPORTANT!)
```
In Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add variable:
   Name: VITE_MONGODB_URI
   Value: mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test
3. Apply to: Production, Preview, Development
4. Save
```

### Step 4: Deploy
```
Click "Deploy" button
Wait for deployment to complete
Check build logs if any errors
```

## DEPLOYMENT ENDPOINTS

After deployment, your endpoints will be:
```
Frontend: https://YOUR-PROJECT-NAME.vercel.app
API Base: https://YOUR-PROJECT-NAME.vercel.app/api

Endpoints:
- GET    https://YOUR-PROJECT-NAME.vercel.app/api/health
- POST   https://YOUR-PROJECT-NAME.vercel.app/api/auth/signup
- POST   https://YOUR-PROJECT-NAME.vercel.app/api/auth/signin
- GET    https://YOUR-PROJECT-NAME.vercel.app/api/posts
- POST   https://YOUR-PROJECT-NAME.vercel.app/api/posts
- GET    https://YOUR-PROJECT-NAME.vercel.app/api/posts/:id
- PUT    https://YOUR-PROJECT-NAME.vercel.app/api/posts/:id
- DELETE https://YOUR-PROJECT-NAME.vercel.app/api/posts/:id
- GET    https://YOUR-PROJECT-NAME.vercel.app/api/marks?userId=...
- POST   https://YOUR-PROJECT-NAME.vercel.app/api/marks
- PUT    https://YOUR-PROJECT-NAME.vercel.app/api/marks/:id
- DELETE https://YOUR-PROJECT-NAME.vercel.app/api/marks/:id
```

## POST-DEPLOYMENT TESTING

After deployment is live:

### Test 1: Frontend loads
```
curl https://YOUR-PROJECT-NAME.vercel.app/
# Should return HTML page
```

### Test 2: API Health Check
```
curl https://YOUR-PROJECT-NAME.vercel.app/api/health
# Expected: {"status":"OK"}
```

### Test 3: Get Posts
```
curl https://YOUR-PROJECT-NAME.vercel.app/api/posts
# Should return array of posts
```

### Test 4: Create User
```
curl -X POST https://YOUR-PROJECT-NAME.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "username":"testuser",
    "password":"password123",
    "confirmPassword":"password123"
  }'
# Should return user object with ID
```

### Test 5: Full UI Testing
1. Open https://YOUR-PROJECT-NAME.vercel.app in browser
2. Create an account
3. Create a blog post
4. View posts on homepage
5. Edit a post
6. Delete a post
7. View marks page
8. Create marks entry

## TROUBLESHOOTING

### Deployment fails with TypeScript errors
1. Run locally: `npm run build`
2. Fix any errors shown
3. Commit changes
4. Redeploy

### Environment variable not found
1. Check Vercel dashboard → Settings → Environment Variables
2. Variable name must be exactly: `VITE_MONGODB_URI`
3. Redeploy after adding variable

### API returns 500 error
1. Check Vercel deployment logs
2. Check MongoDB connection string is correct
3. Verify MongoDB Atlas network access is 0.0.0.0/0
4. Check function timeout (currently 30s in vercel.json)

### CORS errors
1. All functions already have CORS headers
2. If still issues, check browser console for exact error
3. Verify API domain is accessible

### Build logs show "Cannot find module"
1. Ensure node_modules not in .vercelignore (it shouldn't be)
2. Check package.json dependencies
3. Run npm install locally to verify

## ADDITIONAL RESOURCES

- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Project Repository: https://github.com/vishalkh513/my-daily-journey-main
- Build Logs: Check in Vercel → Project → Deployments

---

**Status:** Ready for Vercel deployment ✅
**All systems operational and tested locally** ✅
**Follow the setup instructions above to deploy** ✅
