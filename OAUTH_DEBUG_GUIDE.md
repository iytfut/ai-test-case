# OAuth Debug Guide

## Current Issue: "OAuth error: login_failed"

The error is occurring at the `req.logIn()` step in the OAuth callback, which suggests a session management issue.

## Debug Steps

### 1. Check Backend Configuration

Visit: `https://ai-test-case-backend.onrender.com/api/auth/debug-oauth`

This will show you:

- GitHub OAuth configuration status
- Session configuration
- CORS settings
- Environment variables

### 2. Check Backend Logs

1. Go to your Render dashboard
2. Check the logs for any errors during OAuth flow
3. Look for session-related errors

### 3. Verify GitHub OAuth App Settings

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Find your app and verify:
   - **Authorization callback URL**: `https://ai-test-case-backend.onrender.com/api/auth/callback`
   - **Application name**: Test Case Generator
   - **Homepage URL**: `https://ai-test-case-nu.vercel.app`

### 4. Test OAuth Flow Step by Step

#### Step 1: Test Login Initiation

Visit: `https://ai-test-case-backend.onrender.com/api/auth/login`

This should redirect you to GitHub for authorization.

#### Step 2: Check GitHub Authorization

After clicking "Authorize" on GitHub, you should be redirected to:
`https://ai-test-case-backend.onrender.com/api/auth/callback?code=...`

#### Step 3: Check Callback Processing

The backend should process the callback and redirect to:
`https://ai-test-case-nu.vercel.app/auth/callback?token=...&user=...`

## Common Issues and Solutions

### Issue 1: Session Store Not Working

**Symptoms**: `req.logIn()` fails
**Solution**: Check if MongoDB connection is working

### Issue 2: CORS Issues

**Symptoms**: Frontend can't reach backend
**Solution**: Verify `FRONTEND_URL` environment variable

### Issue 3: GitHub OAuth App Mismatch

**Symptoms**: GitHub redirects to wrong URL
**Solution**: Update GitHub OAuth app callback URL

### Issue 4: Session Configuration

**Symptoms**: Sessions not persisting
**Solution**: Check session store configuration

## Quick Fixes to Try

### Fix 1: Update GitHub OAuth App

1. Go to GitHub OAuth Apps
2. Update callback URL to: `https://ai-test-case-backend.onrender.com/api/auth/callback`
3. Save changes

### Fix 2: Check Environment Variables

Make sure these are set in Render:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL=https://ai-test-case-backend.onrender.com/api/auth/callback`
- `FRONTEND_URL=https://ai-test-case-nu.vercel.app`
- `MONGODB_URI`

### Fix 3: Test with Memory Store

If MongoDB is causing issues, temporarily disable it by removing the `MONGODB_URI` environment variable.

## Debug Endpoints Added

- `GET /api/auth/debug-oauth` - Check OAuth configuration
- `GET /api/debug/session` - Check session status
- `GET /api/auth/test-login` - Test login manually

## Next Steps

1. Check the debug endpoint first
2. Verify GitHub OAuth app settings
3. Check Render logs for errors
4. Test the OAuth flow step by step

Let me know what you find in the debug endpoint and logs!
