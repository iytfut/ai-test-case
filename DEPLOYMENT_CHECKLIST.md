# 🚀 Deployment Checklist - Fix Login Redirect Issue

## ✅ Issues Fixed

1. **Fixed hardcoded URLs in auth middleware** - Now uses environment variables
2. **Fixed CORS configuration** - Simplified to use single origin
3. **Updated redirect URLs** - Now properly formatted with https://

## 🔧 Required Environment Variables

### Backend (Render Dashboard)

Make sure these are set in your Render environment variables:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://ai-test-case-nu.vercel.app
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://ai-test-case-backend.onrender.com/api/auth/callback
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_secure_session_secret
```

### Frontend (Vercel Dashboard)

Make sure these are set in your Vercel environment variables:

```
VITE_API_URL=https://ai-test-case-backend.onrender.com/api
VITE_APP_NAME=TestCase Generator
VITE_APP_VERSION=1.0.0
```

## 🔄 Deployment Steps

1. **Commit and push** all changes to GitHub
2. **Wait for auto-deployment** on both Render and Vercel
3. **Test the login flow**:
   - Go to `https://ai-test-case-nu.vercel.app`
   - Click "Login with GitHub"
   - Should redirect to GitHub OAuth
   - After GitHub auth, should redirect back to your app

## 🐛 What Was Wrong

The issue was in `backend/src/middleware/auth.js`:

- **Before**: `failureRedirect: "ai-test-case-nu.vercel.app/login"` (missing https://)
- **After**: `failureRedirect: "${config.cors.origin}/login"` (uses environment variable)

This caused the malformed URL: `ai-test-case-backend.onrender.com/api/auth/ai-test-case-nu.vercel.app/dashboard`

## ✅ Expected Result

After deployment:

- Login button should redirect to: `https://github.com/login/oauth/authorize?...`
- After GitHub auth, should redirect to: `https://ai-test-case-nu.vercel.app/dashboard`
- No more malformed URLs!

## 🔍 If Still Not Working

1. Check Render logs for any errors
2. Verify all environment variables are set correctly
3. Make sure GitHub OAuth callback URL matches exactly
4. Try hard refresh (Ctrl+F5) or incognito mode
