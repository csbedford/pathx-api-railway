# PathX API Railway Deployment Guide

This is a standalone deployment version of the PathX API service, optimized for Railway deployment.

## Setup Instructions

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `pathx-api-railway`
3. Set to Public
4. Don't initialize with README (we already have files)
5. Create repository

### 2. Push Code to GitHub

```bash
cd /tmp/pathx-api-deploy
git remote add origin https://github.com/YOUR_USERNAME/pathx-api-railway.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Railway

1. Go to https://railway.app/new
2. Choose "Deploy from GitHub repo"
3. Select your `pathx-api-railway` repository
4. Railway will automatically detect the Dockerfile and deploy

### 4. Configure Environment Variables

In Railway project settings, add these environment variables:

```
DATABASE_URL=postgresql://postgres.gyljdgrelnfqtsuwivgp:dwWuFyZNX8URIxSd@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
NODE_ENV=production
PORT=3001
```

### 5. Update Vercel Environment

Once Railway deployment is complete, update your Vercel environment variables:

1. Go to your Vercel project settings
2. Add/update environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-railway-deployment-url.railway.app`

## File Structure

- `Dockerfile`: Simple Docker configuration for Railway
- `railway.json`: Railway deployment configuration
- `package.json`: Standalone package without workspace dependencies
- `src/`: API source code
- `prisma/`: Database schema and migrations

## Notes

- This deployment uses npm instead of pnpm for broader compatibility
- All workspace dependencies have been resolved as standalone packages
- Environment is configured for production deployment
- Prisma client is generated during Docker build process