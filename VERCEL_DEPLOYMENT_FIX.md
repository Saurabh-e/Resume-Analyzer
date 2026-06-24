# Vercel Deployment Fix - 404 on Dynamic Routes

## 🐛 Problem
When navigating to `/analysis/:id`, Vercel returns **404: NOT_FOUND** because it doesn't know how to handle client-side routing.

## ✅ Solution Implemented

### 1. Created `vercel.json` in Client Folder
**Location**: `client/vercel.json`

This file tells Vercel to:
- Rewrite all routes to `index.html` (enables client-side routing)
- Cache static assets properly

### 2. Created `_redirects` File
**Location**: `client/public/_redirects`

This ensures all routes fallback to `index.html` for SPA routing.

### 3. Verified React Router Configuration
✅ Route `/analysis/:id` is properly defined in `App.jsx`

---

## 🚀 Deployment Steps

### Option 1: Deploy Only Frontend (Recommended)

1. **Update Vercel Project Settings**:
   - Go to: https://vercel.com/your-project/settings
   - **Root Directory**: Set to `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

2. **Set Environment Variables**:
   - Go to: Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend.onrender.com/api`

3. **Redeploy**:
   ```bash
   git add .
   git commit -m "Fix: Add Vercel config for SPA routing"
   git push origin main
   ```

### Option 2: Deploy via Vercel CLI

```bash
cd client
vercel --prod
```

---

## 📋 Checklist

Before redeploying, ensure:

- [x] `vercel.json` exists in `client/` folder
- [x] `_redirects` exists in `client/public/` folder
- [x] `VITE_API_URL` environment variable is set on Vercel
- [x] Root directory is set to `client` in Vercel settings
- [x] Build command is `npm run build`
- [x] Output directory is `dist`

---

## 🔍 Why This Happens

### Client-Side Routing (SPA) vs Server-Side Routing

**How SPAs Work**:
1. User visits `/` → Vercel serves `index.html`
2. React Router loads and handles routing client-side
3. User clicks link to `/analysis/123` → React Router handles (no server request)

**The Problem**:
1. User directly visits `/analysis/123` (or refreshes page)
2. Browser makes request to Vercel server
3. Vercel looks for file `/analysis/123.html` → **NOT FOUND (404)**

**The Solution**:
- `vercel.json` tells Vercel: "For ANY route, serve `index.html`"
- React loads and React Router handles the `/analysis/123` route

---

## 🧪 Testing After Deployment

1. **Visit Homepage**: https://your-app.vercel.app/ ✅
2. **Navigate to Analysis**: Click analyze button ✅
3. **Refresh Page**: On `/analysis/:id` route ✅ (Should work now!)
4. **Direct URL**: Paste `/analysis/:id` URL directly ✅

All should work without 404 errors!

---

## 🔧 Troubleshooting

### Still Getting 404?

**1. Check Vercel Deployment Logs**
- Go to: Vercel Dashboard → Deployments → Latest
- Click on the deployment
- Check "Build Logs" for errors

**2. Verify Files Were Deployed**
```bash
# Check if vercel.json is in the deployment
curl https://your-app.vercel.app/vercel.json
# Should return 404 or redirect (means it's working)
```

**3. Check Vercel Project Settings**
- Root Directory: Must be `client` (not project root)
- Framework Preset: Should auto-detect as "Vite"
- Build Command: `npm run build`
- Output Directory: `dist`

**4. Environment Variables**
Make sure `VITE_API_URL` is set:
- Go to: Settings → Environment Variables
- Should be: `https://your-backend.onrender.com/api`
- **Important**: Redeploy after adding env vars!

**5. Force Redeploy**
Sometimes Vercel caches old configs:
```bash
# In Vercel dashboard:
Deployments → Latest → "..." → Redeploy
```

---

## 📱 Alternative: Hash Router (Not Recommended)

If you can't use `vercel.json`, you can use HashRouter instead:

```jsx
// In App.jsx - Change from:
import { BrowserRouter as Router } from 'react-router-dom';

// To:
import { HashRouter as Router } from 'react-router-dom';
```

**URLs will become**: `https://your-app.vercel.app/#/analysis/123`

⚠️ This works but URLs look less professional.

---

## 🎉 Expected Behavior After Fix

### Before Fix:
❌ Direct visit to `/analysis/123` → 404 Error
❌ Refresh on `/analysis/123` → 404 Error
✅ Navigate via React Router → Works

### After Fix:
✅ Direct visit to `/analysis/123` → Works!
✅ Refresh on `/analysis/123` → Works!
✅ Navigate via React Router → Works!

---

## 📦 Files Created

1. **`client/vercel.json`**
   - Handles SPA routing rewrites
   - Configures cache headers

2. **`client/public/_redirects`**
   - Fallback for platforms that support it
   - Works with both Vercel and Netlify

---

## 🚨 Common Mistakes

### 1. Wrong Root Directory
❌ Root directory set to `/` (project root)
✅ Root directory set to `client`

### 2. Missing Environment Variable
❌ `VITE_API_URL` not set
✅ `VITE_API_URL=https://backend.onrender.com/api`

### 3. Old Deployment
❌ Not redeploying after adding `vercel.json`
✅ Commit, push, and verify new deployment

### 4. Build Output Location
❌ Output directory set to `build` (wrong for Vite)
✅ Output directory set to `dist` (Vite default)

---

## 📚 Additional Resources

- [Vercel SPA Configuration](https://vercel.com/docs/projects/project-configuration)
- [React Router on Vercel](https://vercel.com/guides/deploying-react-with-vercel)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## ✅ Quick Fix Summary

**Do this now:**

1. ✅ Verify `client/vercel.json` exists (I created it)
2. ✅ Verify `client/public/_redirects` exists (I created it)
3. ✅ Go to Vercel Dashboard
4. ✅ Settings → Root Directory → Set to `client`
5. ✅ Settings → Environment Variables → Add `VITE_API_URL`
6. ✅ Commit and push these files
7. ✅ Wait for auto-deploy or trigger manual redeploy
8. ✅ Test `/analysis/:id` route

**That's it!** Your 404 error should be fixed. 🎉
