# Vercel Deployment Fix Guide

## ✅ Setup Steps (Complete These in Order)

### Step 1: Install Vercel CLI (Optional but Recommended)
```bash
npm install -g vercel
```

### Step 2: Connect Your Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository: `https://github.com/vishalkh513/my-daily-journey-main`
4. Select "Vite" as the framework
5. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel

**CRITICAL:** Add this environment variable in Vercel Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Click **"Add Environment Variable"**
3. Add the following:

| Key | Value |
|-----|-------|
| `VITE_MONGODB_URI` | `mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test` |

Make sure to set it for all environments: Production, Preview, Development

### Step 4: Configure Build Settings

In Vercel Dashboard → **Settings** → **Build & Development Settings**:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 5: Deploy

Once configured, the deployment should trigger automatically when you push to GitHub.

## 🔧 Vercel Configuration Files

### File: vercel.json
Already configured at root level with:
- Build command: `npm run build`
- Output directory: `dist`
- Serverless functions: `api/**/*.ts` with Node.js 20.x runtime
- Rewrites for SPA routing
- CORS support

### File: .vercelignore  
Excludes unnecessary files from deployment:
- node_modules
- test files
- local server files
- config files

## 📁 Serverless API Functions

All functions are properly configured at `/api`:

```
/api/
├── /auth/
│   ├── signin.ts  - POST login endpoint
│   └── signup.ts  - POST registration endpoint
├── /posts/
│   ├── index.ts   - GET all posts, POST create post
│   └── [id].ts    - GET/PUT/DELETE individual posts
├── /marks/
│   ├── index.ts   - GET marks, POST create marks
│   └── [id].ts    - PUT/DELETE individual marks
└── index.ts       - Root health check
```

Each function:
- ✅ Handles CORS properly
- ✅ Uses MongoDB connection pooling
- ✅ Implements proper error handling
- ✅ Returns correct HTTP status codes
- ✅ Supports authentication checks

## 🧪 Testing Your Deployment

### Test 1: Health Check
```bash
curl https://YOUR-PROJECT.vercel.app/api/health
# Expected: {"status":"OK"}
```

### Test 2: Get All Posts
```bash
curl https://YOUR-PROJECT.vercel.app/api/posts
# Expected: Array of posts JSON
```

### Test 3: Create User
```bash
curl -X POST https://YOUR-PROJECT.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "username":"testuser",
    "password":"password123",
    "confirmPassword":"password123"
  }'
```

### Test 4: Create Post
```bash
curl -X POST https://YOUR-PROJECT.vercel.app/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"USER_ID",
    "title":"Test Post",
    "content":"Test content",
    "mood":"happy"
  }'
```

## ⚠️ Common Issues & Solutions

### Issue 1: "VITE_MONGODB_URI is undefined"
**Solution:** 
- Add `VITE_MONGODB_URI` environment variable in Vercel dashboard
- Ensure value: `mongodb+srv://vishal:vishal123@test.jogzeev.mongodb.net/mydatabase?appName=test`
- Redeploy after adding

### Issue 2: "Cannot find module"
**Solution:**
- Run `npm install` locally to ensure all packages installed
- Check `package.json` has all dependencies
- Commit `package-lock.json` or `bun.lockb` to Git

### Issue 3: Functions returning 404
**Solution:**
- Verify `/api` folder structure matches above
- Ensure all `.ts` files have proper TypeScript syntax
- Check Vercel build logs for compilation errors

### Issue 4: CORS errors
**Solution:**
- All functions already have CORS headers configured
- If still issues, add to `vercel.json`:
  ```json
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "Access-Control-Allow-Origin", "value": "*"}
      ]
    }
  ]
  ```

### Issue 5: Database connection timeout
**Solution:**
- Verify MongoDB URI is correct
- Ensure MongoDB Atlas network access allows Vercel IPs (0.0.0.0/0)
- Check connection pooling: functions use `cachedClient` to reuse connections
- Increase timeout in `vercel.json` if needed (currently 30s)

### Issue 6: Build fails with TypeScript errors
**Solution:**
- Check `tsconfig.json` is valid
- Run `npm run build` locally first
- Fix any compilation errors shown
- Commit fixes and redeploy

## 🚀 Deployment Checklist

Before deploying, ensure:
- [ ] All code committed to GitHub
- [ ] `vercel.json` exists at project root
- [ ] `.vercelignore` exists at project root
- [ ] `package.json` has correct build script
- [ ] All API functions in `/api` folder
- [ ] Environment variables set in Vercel dashboard
- [ ] `.env.example` documents required variables
- [ ] Local build works: `npm run build`

## 📊 Project Structure for Vercel

```
my-daily-journey-main/
├── api/                      # Serverless functions
│   ├── auth/
│   ├── posts/
│   ├── marks/
│   └── index.ts
├── src/                       # React frontend
├── dist/                      # Built output (Vercel serves this)
├── vercel.json               # Vercel configuration
├── .vercelignore            # Files to exclude
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies & scripts
```

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Project URL: `https://YOUR-PROJECT-NAME.vercel.app`
- Build Logs: Check in Vercel dashboard → Deployments
- MongoDB Atlas: https://cloud.mongodb.com

## ✅ After Deployment

1. Test all endpoints on your Vercel URL
2. Test from mobile device to ensure CORS works
3. Create test user and post on production
4. Verify posts appear in MongoDB Atlas
5. Test update and delete operations
6. Check error handling (bad requests, etc.)

---

**Your application is now ready for production deployment on Vercel!**
