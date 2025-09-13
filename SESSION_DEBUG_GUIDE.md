# 🔍 Session Debug Guide - Login Loop Fix

## 🚨 Current Issue

User gets redirected to login page after GitHub OAuth authentication, even though the OAuth flow completes successfully.

## 🔧 Fixes Applied

### 1. **Session Configuration Updates**

- Changed `resave: true` and `saveUninitialized: true` to force session saving
- Added explicit session save after login
- Enhanced debugging logs

### 2. **Added Debug Endpoints**

- `/debug/session` - Shows current session status
- `/api/auth/test-login` - Manually sets a test user in session

## 🧪 Debug Steps

### Step 1: Test Session Persistence

1. **Visit**: `https://ai-test-case-backend.onrender.com/api/auth/test-login`
2. **Check if it returns success** and shows user data
3. **Then visit**: `https://ai-test-case-backend.onrender.com/debug/session`
4. **Check if `isAuthenticated` is now `true`**

### Step 2: Test GitHub OAuth Flow

1. **Clear browser data** (cookies, local storage)
2. **Go to**: `https://ai-test-case-nu.vercel.app`
3. **Click "Login with GitHub"**
4. **Complete GitHub OAuth**
5. **Check Render logs** for:
   - "Serializing user: [username] [id]"
   - "User logged in successfully: [username]"
   - "Session saved, user in session: [user object]"

### Step 3: Check Session After OAuth

1. **After OAuth redirect**, visit: `https://ai-test-case-backend.onrender.com/debug/session`
2. **Look for**:
   - `isAuthenticated: true`
   - User data in the response
   - Session ID should be the same

## 🐛 Expected Results

### If Test Login Works:

- Session persistence is working
- Issue is with GitHub OAuth callback
- Check GitHub OAuth configuration

### If Test Login Fails:

- Session configuration issue
- Check SESSION_SECRET in Render
- Check CORS configuration

## 🔧 Environment Variables Check

Make sure these are set in Render:

```
NODE_ENV=production
SESSION_SECRET=your_very_secure_secret_here
FRONTEND_URL=https://ai-test-case-nu.vercel.app
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=https://ai-test-case-backend.onrender.com/api/auth/callback
```

## 📝 Debugging Commands

### Check Session Status:

```bash
curl https://ai-test-case-backend.onrender.com/debug/session
```

### Test Manual Login:

```bash
curl https://ai-test-case-backend.onrender.com/api/auth/test-login
```

### Check Auth Status:

```bash
curl https://ai-test-case-backend.onrender.com/api/auth/status
```

## 🆘 Troubleshooting

### Issue 1: Test Login Fails

**Solution**: Check SESSION_SECRET is set in Render environment variables

### Issue 2: Test Login Works, OAuth Doesn't

**Solution**: Check GitHub OAuth configuration and callback URL

### Issue 3: Session Not Persisting

**Solution**: Check CORS configuration and cookie settings

## 🔄 Next Steps

1. **Deploy these changes**
2. **Test the debug endpoints**
3. **Try the GitHub OAuth flow**
4. **Check the logs**
5. **Report back what you see**

## 📊 What to Look For

### In Debug Endpoint Response:

```json
{
  "sessionID": "some-session-id",
  "isAuthenticated": true, // Should be true after login
  "user": {
    // Should have user data
    "id": "user-id",
    "username": "username"
  }
}
```

### In Render Logs:

- "Serializing user: [username] [id]"
- "User logged in successfully: [username]"
- "Session saved, user in session: [user object]"
- No error messages
