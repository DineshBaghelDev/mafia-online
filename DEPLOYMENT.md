# Deployment Guide

This guide will help you deploy your Mafia game to production.

## Prerequisites

- A GitHub repository with your code
- Accounts on deployment platforms (see recommendations below)

## Recommended Deployment Stack

### Option 1: Simple & Free (Recommended for beginners)
- **Backend**: Railway or Render
- **Frontend**: Vercel
- **Database**: Railway Redis (included)

### Option 2: AWS/Professional
- **Backend**: AWS EC2 or ECS
- **Frontend**: AWS Amplify or CloudFront + S3
- **Database**: AWS ElastiCache (Redis)

## Step-by-Step Deployment

### 1. Backend Deployment (Railway - Recommended)

#### Railway Setup

1. Go to [Railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect your backend

#### Configure Environment Variables

In Railway dashboard, add these variables:

```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

#### Add Redis (Optional but recommended)

1. In your Railway project, click "+ New"
2. Select "Database" → "Redis"
3. Railway will auto-create `REDIS_URL` environment variable
4. Your backend will automatically connect

#### Deploy

1. Railway will automatically deploy when you push to main branch
2. Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### 2. Frontend Deployment (Vercel - Recommended)

#### Vercel Setup

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Configure Environment Variables

Add this environment variable:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend.up.railway.app
```

#### Deploy

1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a URL like `https://your-app.vercel.app`

### 3. Update Backend CORS

Go back to Railway and update `CORS_ORIGIN`:

```env
CORS_ORIGIN=https://your-app.vercel.app
```

### 4. Test Your Deployment

1. Visit your Vercel URL
2. Create a room or join matchmaking
3. Test with multiple devices/browsers

## Alternative: Render Deployment

### Backend on Render

1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: Backend
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

Environment Variables:
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.onrender.com
```

### Frontend on Render

1. New → Static Site
2. Configure:
   - **Root Directory**: Frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `Frontend/.next`

Environment Variables:
```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

## Database Options

### Redis (Optional)

**Railway**: Built-in Redis database
**Render**: Use Upstash Redis (free tier available)
**AWS**: ElastiCache

If you don't set up Redis, the app will use in-memory storage (resets on restart).

### PostgreSQL (Future Feature)

The database schemas are ready in `Backend/src/db/schema.sql` for future persistence features.

**Railway**: Built-in PostgreSQL
**Render**: Built-in PostgreSQL
**AWS**: RDS

## Custom Domain Setup

### Frontend (Vercel)

1. Go to your Vercel project settings
2. Domains → Add Domain
3. Follow DNS configuration instructions

### Backend (Railway)

1. Go to your Railway service settings
2. Settings → Networking → Custom Domain
3. Add your domain and configure DNS

## Environment Variables Summary

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SOCKET_URL=https://your-backend.com
```

## Monitoring & Logs

### Railway
- View logs in the Railway dashboard
- Click on your service → Deployments → View logs

### Vercel
- Go to project → Deployments → Select deployment → View logs
- Runtime logs available in real-time

### Render
- Dashboard → Select service → Logs tab

## Troubleshooting

### WebSocket Connection Issues

1. **Check CORS**: Make sure `CORS_ORIGIN` matches your frontend URL exactly
2. **HTTPS**: Ensure both frontend and backend use HTTPS in production
3. **WebSocket URL**: Verify `NEXT_PUBLIC_SOCKET_URL` is correct

### Backend Not Starting

1. Check logs for errors
2. Verify all environment variables are set
3. Ensure Redis is accessible (or remove Redis config to use in-memory)

### Frontend Build Errors

1. Check Node.js version (use 18+)
2. Verify all dependencies are in `package.json`
3. Check build logs for specific errors

## Performance Tips

1. **Enable Redis**: Use Redis for better performance with multiple concurrent games
2. **CDN**: Vercel includes CDN automatically
3. **Compression**: Already enabled in backend config
4. **Minification**: Next.js handles this automatically

## Security Checklist

- ✅ CORS configured correctly
- ✅ Environment variables secured
- ✅ No sensitive data in code
- ✅ HTTPS enabled
- ✅ Rate limiting (consider adding for production)

## Scaling Considerations

For high traffic:
- Use Redis for session storage
- Consider adding a load balancer
- Enable horizontal scaling on Railway/Render
- Monitor memory usage

## Cost Estimates

### Free Tier (Good for testing)
- **Vercel**: Free for personal projects
- **Railway**: $5 free credit/month, then ~$5-20/month
- **Render**: Free tier available (with sleep)

### Production (Paid)
- **Vercel Pro**: $20/month
- **Railway**: ~$10-50/month depending on usage
- **AWS**: Variable, ~$30-100/month

## Support

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test locally first with production build
4. Check platform-specific documentation

Good luck with your deployment! 🚀
