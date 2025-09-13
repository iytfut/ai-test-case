# 🍪 Cookie Fix Guide - Cross-Domain Session Issue

## 🚨 Issue Confirmed

The session cookie is not being sent back to the server in subsequent requests. Each request gets a new session because the browser is not sending the session cookie back.

**Evidence**: Different sessionIDs in each request

- test-session-set: `L4MTTgdRwq8lyK5UIISMZlQcyiZ8q6NR`
- test-session-get: `B7k-VcFXYCaz_CVaUc5S7MWv9uOV6QRa` (different!)
- test-session-get: `oKK5t2nL7qk1s9gnCXmQHudjsw1Fo_PD` (different!)

## 🔧 Fixes Applied

### 1. **Manual Cookie Setting**

- Added explicit `res.cookie()` calls in test endpoints
- Set `httpOnly: false` for debugging
- Configured proper cross-domain cookie settings

### 2. **Enhanced Session Configuration**

- Set `httpOnly: false` to allow client-side debugging
- Maintained `sameSite: "none"` for cross-domain
- Set `domain: undefined` for cross-origin requests

## 🧪 Test the Fix

### Step 1: Test Manual Cookie Setting

1. **Visit**: `https://ai-test-case-backend.onrender.com/api/auth/test-session-set`
2. **Check if `cookieSet: true`** in response
3. **Check browser dev tools** → Application → Cookies
4. **Look for `test-case-generator.sid` cookie**

### Step 2: Test Session Persistence

1. **Immediately after step 1**, visit: `https://ai-test-case-backend.onrender.com/api/auth/test-session-get`
2. **Check if same sessionID** is returned
3. **Check if `testValue` and `testTime`** are present

### Step 3: Test Authentication

1. **Visit**: `https://ai-test-case-backend.onrender.com/api/auth/test-login`
2. **Check if `cookieSet: true`** in response
3. **Visit**: `https://ai-test-case-backend.onrender.com/api/auth/test-session`
4. **Check if `isAuthenticated: true`** and user data present

## 🔍 What to Look For

### In Browser Dev Tools:

1. **Application tab** → **Cookies** → `ai-test-case-backend.onrender.com`
2. **Look for**: `test-case-generator.sid` cookie
3. **Check cookie properties**:
   - Secure: true
   - HttpOnly: false
   - SameSite: none
   - Domain: (not set)

### In API Responses:

- **cookieSet: true** - Cookie was set successfully
- **Same sessionID** - Cookie is being sent back
- **isAuthenticated: true** - Authentication is working

## 🎯 Expected Results

1. **Cookie should be visible** in browser dev tools
2. **Same sessionID** should be returned in subsequent requests
3. **Session data should persist** across requests
4. **Authentication should work** and persist

## 🆘 If Still Not Working

### Check Browser Settings:

1. **Third-party cookies** - Make sure they're allowed
2. **Privacy settings** - Check if cookies are blocked
3. **Incognito mode** - Try in incognito to rule out extensions

### Check Network Tab:

1. **Request headers** - Look for `Cookie: test-case-generator.sid=...`
2. **Response headers** - Look for `Set-Cookie: test-case-generator.sid=...`
3. **CORS headers** - Check if `Access-Control-Allow-Credentials: true`

## 🔄 Next Steps

1. **Deploy these changes**
2. **Test the cookie setting**
3. **Check browser dev tools**
4. **Test session persistence**
5. **Test authentication flow**

If the manual cookie setting works, we can apply the same fix to the GitHub OAuth callback.
