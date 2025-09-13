# 🔍 Session Persistence Test Guide

## 🚨 Current Issue

Session is being created but not persisting between requests. The test login works but the session doesn't carry over to subsequent requests.

## 🧪 Testing Steps

### Step 1: Test Session Creation

1. **Visit**: `https://ai-test-case-backend.onrender.com/api/auth/test-login`
2. **Check response** - should show success and sessionID
3. **Check Render logs** for detailed session information

### Step 2: Test Session Persistence

1. **Immediately after test login**, visit: `https://ai-test-case-backend.onrender.com/api/auth/test-session`
2. **Check if `isAuthenticated` is `true`**
3. **Check if `user` data is present**

### Step 3: Test Cross-Request Persistence

1. **Wait 5 seconds**
2. **Visit**: `https://ai-test-case-backend.onrender.com/debug/session`
3. **Check if session persists**

## 🔍 What to Look For

### In Test Login Response:

```json
{
  "success": true,
  "message": "Test user logged in",
  "user": { "username": "testuser" },
  "sessionID": "some-session-id"
}
```

### In Test Session Response (should be same session):

```json
{
  "sessionID": "same-session-id",
  "isAuthenticated": true,
  "user": { "username": "testuser" },
  "message": "Session check completed"
}
```

### In Render Logs:

- "Test login - Before login: ..."
- "Test login - After login: ..."
- "Test login - Session saved successfully"
- "Test session check: ..."

## 🐛 Possible Issues

### Issue 1: Session Not Saving

**Symptoms**: Test login works but test-session shows `isAuthenticated: false`
**Cause**: Session not being saved properly
**Solution**: Check session configuration

### Issue 2: Cookie Not Being Sent

**Symptoms**: Different sessionID in each request
**Cause**: Cookie not being sent back to server
**Solution**: Check CORS and cookie settings

### Issue 3: Session Store Issue

**Symptoms**: Session saved but not retrieved
**Cause**: Memory store not working properly
**Solution**: Check session store configuration

## 🔧 Debug Commands

### Test Login:

```bash
curl https://ai-test-case-backend.onrender.com/api/auth/test-login
```

### Test Session:

```bash
curl https://ai-test-case-backend.onrender.com/api/auth/test-session
```

### Debug Session:

```bash
curl https://ai-test-case-backend.onrender.com/debug/session
```

## 🎯 Expected Results

1. **Test login should work** and return success
2. **Test session should show** `isAuthenticated: true` with same sessionID
3. **Debug session should show** user data persisted
4. **All requests should use** the same sessionID

## 🆘 If Session Still Not Persisting

The issue might be:

1. **Cookie domain mismatch**
2. **CORS not allowing credentials**
3. **Session store not working**
4. **Cookie not being set properly**

We'll need to check the browser's Network tab to see if cookies are being sent with requests.
