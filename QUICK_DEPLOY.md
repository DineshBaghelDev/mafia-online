# 🚀 Quick Deploy Guide

The fastest way to get your Mafia game online.

## ⏱️ 15-Minute Deployment

### Step 1: Backend (5 minutes)

1. **Sign up at [Railway.app](https://railway.app)**
   
2. **New Project → Deploy from GitHub**
   - Select your repository
   - Root directory: `Backend`
   
3. **Add Environment Variables:**
   ```
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=*
   ```
   (We'll update CORS later)

4. **Add Redis:**
   - Click "+ New" → Database → Redis
   - Railway auto-configures connection

5. **Deploy!**
   - Copy your backend URL (e.g., `https://mafia-backend.up.railway.app`)

### Step 2: Frontend (5 minutes)

1. **Sign up at [Vercel.com](https://vercel.com)**

2. **Add New → Project**
   - Import from GitHub
   - Root directory: `Frontend`
   - Framework: Next.js

3. **Add Environment Variable:**
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.up.railway.app
   ```
   (Use the URL from Step 1)

4. **Deploy!**
   - Copy your frontend URL (e.g., `https://mafia-game.vercel.app`)

### Step 3: Final Configuration (5 minutes)

1. **Update Backend CORS:**
   - Go back to Railway
   - Update `CORS_ORIGIN` to: `https://mafia-game.vercel.app`
   - Redeploy

2. **Test Your Game:**
   - Visit your Vercel URL
   - Create a room
   - Open in another browser/device
   - Join and play!

## ✅ Done!

Your game is now live and accessible worldwide!

## 🔗 URLs to Save

- **Play Game:** `https://your-app.vercel.app`
- **Backend API:** `https://your-app.up.railway.app`
- **Health Check:** `https://your-app.up.railway.app/health`

## 💰 Cost

- **Railway:** ~$5-10/month
- **Vercel:** Free (or $20/month for Pro)
- **Total:** $5-30/month depending on usage

## 🎮 Share Your Game

Send your Vercel URL to friends and start playing!

---

For more detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)
