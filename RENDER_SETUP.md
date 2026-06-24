# Complete Render Deployment Setup Guide

## Current Deployment URLs
- Frontend: https://resume-analyzer-uzym.onrender.com/
- Backend: https://[YOUR-BACKEND-SERVICE].onrender.com/

## Issue: Frontend showing errors
**Root Cause:** The frontend environment variable `VITE_API_URL` is not configured on Render.

---

## Step-by-Step Fix

### 1. Find Your Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your **backend API service** (probably named something like `ai-resume-analyzer-api`)
3. Copy the URL (it should look like: `https://ai-resume-analyzer-api-xxxx.onrender.com`)

### 2. Configure Frontend Environment Variable

1. Go to your **frontend service** on Render (`resume-analyzer-uzym`)
2. Click on **"Environment"** tab in the left sidebar
3. Click **"Add Environment Variable"**
4. Add the following:
   ```
   Key: VITE_API_URL
   Value: https://YOUR-BACKEND-SERVICE.onrender.com/api
   ```
   ⚠️ **IMPORTANT:** 
   - Replace `YOUR-BACKEND-SERVICE` with your actual backend URL
   - Make sure to include `/api` at the end
   - Example: `https://ai-resume-analyzer-api-xxxx.onrender.com/api`

5. Click **"Save Changes"**

### 3. Trigger Manual Redeploy

After adding the environment variable:

1. Go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Wait for the build to complete (5-10 minutes)

**Why redeploy?** Vite bakes environment variables into the build at compile time. Just adding the env var doesn't update the already-built files.

### 4. Update Backend CORS

Now update your backend to allow the frontend:

1. Go to your **backend service** on Render
2. Click **"Environment"** tab
3. Find or add the `CLIENT_URL` variable:
   ```
   Key: CLIENT_URL
   Value: https://resume-analyzer-uzym.onrender.com
   ```
4. Click **"Save Changes"** (backend will auto-redeploy)

### 5. Verify the Fix

After both services redeploy:

1. **Test Backend Health:**
   ```
   https://YOUR-BACKEND-SERVICE.onrender.com/health
   ```
   Should return JSON with `"success": true`

2. **Test Frontend:**
   Visit: `https://resume-analyzer-uzym.onrender.com/`
   - Try to register/login
   - Check browser console for errors (F12 → Console)

---

## Complete Environment Variables Checklist

### Backend Service Environment Variables

```bash
NODE_ENV=production
PORT=10000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-analyzer?retryWrites=true&w=majority

# Generate with: node backend/generate-jwt-secret.js
JWT_SECRET=your-64-character-random-secret-here
JWT_EXPIRE=7d

# Get from: https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_api_key_here

# File upload settings
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Frontend URL (NO trailing slash)
CLIENT_URL=https://resume-analyzer-uzym.onrender.com

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Service Environment Variables

```bash
# Backend API URL (MUST include /api)
VITE_API_URL=https://YOUR-BACKEND-SERVICE.onrender.com/api
```

---

## Troubleshooting

### Issue: "Route /auth/login not found"
**Cause:** Frontend's `VITE_API_URL` is missing or incorrect
**Fix:** 
- Add `VITE_API_URL` to frontend environment variables
- Must end with `/api`
- Redeploy frontend after adding

### Issue: CORS errors
**Cause:** Backend's `CLIENT_URL` doesn't match frontend URL
**Fix:**
- Set `CLIENT_URL=https://resume-analyzer-uzym.onrender.com` on backend
- No trailing slash
- Must be exact match

### Issue: "Cannot connect to server"
**Cause:** Backend service is not running
**Fix:**
- Check backend logs on Render
- Verify all required env vars are set
- Check MongoDB connection

### Issue: MongoDB connection failed
**Cause:** MongoDB Atlas IP whitelist or connection string
**Fix:**
- Go to MongoDB Atlas → Network Access
- Add `0.0.0.0/0` to allow all IPs
- Verify connection string in `MONGODB_URI`

### Issue: Service spins down (Free Tier)
**Cause:** Render free tier spins down after 15 minutes of inactivity
**Fix:**
- First request will be slow (30-60 seconds)
- Use [UptimeRobot](https://uptimerobot.com/) to ping every 14 minutes
- Or upgrade to paid plan ($7/month)

---

## Testing After Deployment

### 1. Test Backend Directly

```bash
# Health check
curl https://YOUR-BACKEND-SERVICE.onrender.com/health

# List routes (debugging)
curl https://YOUR-BACKEND-SERVICE.onrender.com/api/routes

# Test registration
curl -X POST https://YOUR-BACKEND-SERVICE.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'
```

### 2. Test Frontend

1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit: `https://resume-analyzer-uzym.onrender.com/`
4. Try to login/register
5. Check:
   - Request URL should be `https://YOUR-BACKEND.onrender.com/api/auth/login`
   - Should NOT be `/auth/login` (missing domain and `/api`)

---

## Build Commands Reference

### Backend
```bash
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

### Frontend
```bash
Build Command: cd client && npm install && npm run build
Start Command: cd client && npx serve -s dist -l $PORT
```

---

## Important Notes

### Free Tier Limitations
- **Spin down:** Services sleep after 15 min of inactivity
- **Cold start:** First request takes 30-60 seconds
- **Hours:** 750 hours/month per service

### Environment Variables
- Vite variables MUST start with `VITE_`
- Vite builds env vars into the bundle at build time
- Changing env vars requires a rebuild/redeploy

### CORS
- Backend currently allows the frontend URL
- Make sure `CLIENT_URL` has NO trailing slash
- Frontend URL must match exactly

---

## Quick Commands

### Generate JWT Secret
```bash
cd backend
node generate-jwt-secret.js
```

### Test locally before deploying
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd client
npm install
npm run dev
```

---

## Support

If issues persist:

1. **Check Render Logs:**
   - Go to service → Logs tab
   - Look for errors during startup

2. **Check Browser Console:**
   - F12 → Console tab
   - Look for network errors

3. **Verify Environment Variables:**
   - Backend: All required vars set?
   - Frontend: `VITE_API_URL` set correctly?

4. **Test Backend Health:**
   - Visit `/health` endpoint
   - Should return JSON with success

5. **Check MongoDB:**
   - Atlas → Network Access
   - Allow 0.0.0.0/0
   - Verify connection string

---

## Next Steps After Fixing

Once everything works:

1. ✅ Test user registration
2. ✅ Test user login
3. ✅ Test resume upload
4. ✅ Test AI analysis
5. ✅ Monitor logs for errors
6. ✅ Set up monitoring (optional)
7. ✅ Consider UptimeRobot for free tier

## Production Optimization (Optional)

1. Add custom domain
2. Enable Render's Auto-Scale (paid)
3. Add Redis for caching (paid)
4. Set up monitoring/alerts
5. Add analytics
