# Deployment Guide - Render

## Backend Deployment Steps

### 1. Prerequisites
- GitHub repository with your code
- Render account (free tier works)
- MongoDB Atlas account (free tier works)

### 2. Deploy Backend to Render

#### Option A: Using Render Dashboard (Recommended)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

2. **Configure Build Settings**
   ```
   Name: ai-resume-analyzer-api (or your preferred name)
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Configure Environment Variables**
   Add these environment variables in Render dashboard:
   
   **Required Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://YOUR_MONGODB_CONNECTION_STRING
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   JWT_EXPIRE=7d
   GROQ_API_KEY=your-groq-api-key
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
   
   **Optional Variables (with defaults):**
   ```
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://your-service.onrender.com`

#### Option B: Using render.yaml (Infrastructure as Code)

1. Push `render.yaml` to your repository root
2. Go to Render Dashboard → "Blueprints" → "New Blueprint Instance"
3. Connect your repository
4. Set environment variables manually (they won't auto-import for security)

### 3. Configure MongoDB Atlas

1. **Whitelist Render IP Addresses**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific Render IP ranges

2. **Get Connection String**
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add it as `MONGODB_URI` in Render

### 4. Test Backend Deployment

After deployment completes:

1. **Check Health Endpoint**
   ```bash
   curl https://your-service.onrender.com/health
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "environment": "production",
     "mongodb": "Connected"
   }
   ```

2. **Check CORS Configuration**
   - Look at Render logs for CORS configuration output
   - Verify CLIENT_URL is set correctly

### 5. Update Frontend

Update your frontend `.env` file:

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## Frontend Deployment (Vercel/Netlify)

### Vercel Deployment

1. Install Vercel CLI (optional)
   ```bash
   npm install -g vercel
   ```

2. Deploy via Dashboard
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Configure:
     ```
     Framework Preset: Vite
     Root Directory: client
     Build Command: npm run build
     Output Directory: dist
     ```

3. Add Environment Variable
   ```
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```

4. Deploy and get your frontend URL
   ```
   https://your-app.vercel.app
   ```

5. **IMPORTANT**: Copy this URL and add it to Render backend environment variables:
   ```
   CLIENT_URL=https://your-app.vercel.app
   ```

### Netlify Deployment

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Configure:
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```
5. Copy frontend URL and update `CLIENT_URL` in Render backend

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for 1 service 24/7)

**Solutions:**
- Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 14 minutes
- Upgrade to paid plan ($7/month) for always-on service

### CORS Configuration

The current CORS configuration **allows all origins in production** for initial setup. Once deployed:

1. Check Render logs to see the actual frontend origin
2. Update `CLIENT_URL` environment variable to match exactly
3. After confirming it works, you can tighten CORS by modifying `app.js`:
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     // Change this to check allowedOrigins instead of allowing all
     if (allowedOrigins.includes(origin)) {
       return callback(null, true);
     }
     return callback(new Error('Not allowed by CORS'));
   }
   ```

### Environment Variables Checklist

Before going live, ensure these are set:

Backend (Render):
- ✅ NODE_ENV=production
- ✅ MONGODB_URI (from MongoDB Atlas)
- ✅ JWT_SECRET (generate a secure random string)
- ✅ GROQ_API_KEY (from Groq dashboard)
- ✅ CLIENT_URL (your frontend URL)

Frontend (Vercel/Netlify):
- ✅ VITE_API_URL (your backend URL + /api)

### Troubleshooting

**Backend won't start:**
- Check Render logs for missing environment variables
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas allows Render IPs

**CORS errors:**
- Verify CLIENT_URL matches your frontend URL exactly (including https://)
- Check Render logs for CORS debug messages
- Ensure no trailing slashes in URLs

**Frontend can't connect:**
- Verify VITE_API_URL is correct
- Check if backend is running (visit /health endpoint)
- Look at browser console for exact error messages

**MongoDB connection fails:**
- Whitelist 0.0.0.0/0 in MongoDB Atlas Network Access
- Verify connection string has correct password
- Check if database user has proper permissions

### Monitoring

1. **Render Dashboard:** Monitor service health, logs, and metrics
2. **MongoDB Atlas:** Track database connections and queries
3. **Browser DevTools:** Check network requests and CORS headers

### Security Recommendations for Production

1. Use strong JWT_SECRET (32+ characters, random)
2. Restrict CORS to specific frontend domain
3. Enable MongoDB IP whitelist with specific IPs
4. Use environment variables for all secrets
5. Enable MongoDB authentication
6. Set up monitoring and alerts
7. Use HTTPS only (Render provides this by default)

## Quick Deploy Checklist

- [ ] Backend deployed to Render
- [ ] Environment variables configured on Render
- [ ] MongoDB Atlas configured and accessible
- [ ] Backend health check passes
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Frontend environment variable set
- [ ] CLIENT_URL updated in backend with frontend URL
- [ ] Test login/register from deployed frontend
- [ ] Test file upload functionality
- [ ] Check logs for errors

## Support

If you encounter issues:
1. Check Render logs first
2. Verify all environment variables are set
3. Test backend /health endpoint directly
4. Check browser console for frontend errors
5. Verify CORS headers in browser network tab
