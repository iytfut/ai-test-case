# Production Deployment Guide

## Issues Fixed for Production

### Backend (Render.com) Configuration

1. **Environment Variables**: Added all required environment variables to `render.yaml`
2. **MongoDB Session Store**: Configured MongoDB for persistent session storage
3. **CORS Configuration**: Updated to allow production frontend URLs
4. **OAuth Callback**: Fixed to redirect to frontend with token and user data

### Frontend (Vercel) Configuration

1. **Environment Variables**: Created `.env.production` with correct API URL
2. **OAuth Callback Route**: Added `/auth/callback` route to handle OAuth redirects
3. **Session Persistence**: Added localStorage support for authentication state

## Deployment Steps

### 1. Deploy Backend to Render

```bash
# Push changes to your repository
git add .
git commit -m "Fix production OAuth configuration"
git push origin main
```

The backend will automatically deploy on Render with the updated `render.yaml` configuration.

### 2. Deploy Frontend to Vercel

```bash
cd frontend
# Build and deploy
vercel --prod
```

Or push to your repository if you have auto-deployment enabled.

### 3. Verify GitHub OAuth App Settings

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Ensure the callback URL is set to: `https://ai-test-case-backend.onrender.com/api/auth/callback`

## Production URLs

- **Backend**: https://ai-test-case-backend.onrender.com
- **Frontend**: https://ai-test-case-nu.vercel.app

## Environment Variables Set in Production

### Backend (Render)

- `NODE_ENV=production`
- `PORT=10000`
- `SESSION_SECRET` (auto-generated)
- `MONGODB_URI` (your MongoDB connection string)
- `GITHUB_CLIENT_ID` (your GitHub OAuth app client ID)
- `GITHUB_CLIENT_SECRET` (your GitHub OAuth app client secret)
- `GITHUB_CALLBACK_URL=https://ai-test-case-backend.onrender.com/api/auth/callback`
- `GEMINI_API_KEY` (your Gemini API key)
- `FRONTEND_URL=https://ai-test-case-nu.vercel.app`

### Frontend (Vercel)

- `VITE_API_URL=https://ai-test-case-backend.onrender.com/api`

## Testing the OAuth Flow

1. **Visit the production frontend**: https://ai-test-case-nu.vercel.app
2. **Click "Continue with GitHub"**
3. **Authorize the application on GitHub**
4. **You should be redirected back to the app and logged in**

## Troubleshooting

### If OAuth Still Fails:

1. **Check Render logs** for any errors
2. **Verify GitHub OAuth app settings** match the production callback URL
3. **Check CORS errors** in browser console
4. **Ensure MongoDB connection** is working (check Render logs)

### Common Issues:

- **CORS errors**: Frontend URL not in allowed origins
- **Session issues**: MongoDB connection problems
- **OAuth errors**: Incorrect callback URL in GitHub app settings

## Key Changes Made

1. **Backend**:

   - Added MongoDB session store for production
   - Fixed OAuth callback to redirect with token and user data
   - Updated CORS to allow production frontend URL
   - Set all environment variables in `render.yaml`

2. **Frontend**:
   - Added `/auth/callback` route to handle OAuth redirects
   - Enhanced `AuthContext` with localStorage persistence
   - Created `AuthCallback` component for OAuth handling

The OAuth flow should now work perfectly in production!
