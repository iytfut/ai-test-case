# 🍪 Cookie Debug Test - Cross-Domain Session Issue

## 🚨 Issue Identified

Session is being created but `isAuthenticated` is `false` because the session cookie is not being sent back to the server in subsequent requests.

## 🧪 Cookie Debug Test Steps

### Step 1: Test Simple Session Storage

1. **Visit**: `https://ai-test-case-backend.onrender.com/api/auth/test-session-set`
2. **Note the sessionID** from the response
3. **Check if it returns success**

### Step 2: Test Session Retrieval

1. **Immediately after step 1**, visit: `https://ai-test-case-backend.onrender.com/api/auth/test-session-get`
2. **Check if it shows the same sessionID**
3. **Check if `testValue` and `testTime` are present**

### Step 3: Test Cross-Request Persistence

1. **Wait 5 seconds**
2. **Visit**: `https://ai-test-case-backend.onrender.com/api/auth/test-session-get`
3. **Check if session data persists**

## 🔍 What to Look For

### Expected Response from test-session-set:

```json
{
  "success": true,
  "message": "Session value set",
  "sessionID": "some-session-id",
  "testValue": "test-session-data",
  "testTime": "2025-01-14T07:30:00.000Z"
}
```

### Expected Response from test-session-get:

```json
{
  "sessionID": "same-session-id",
  "testValue": "test-session-data",
  "testTime": "2025-01-14T07:30:00.000Z",
  "message": "Session value retrieved",
  "cookies": {...},
  "cookieHeader": "test-case-generator.sid=some-session-id"
}
```

## 🐛 Possible Results

### Result 1: Session Works (Same sessionID, data present)

**Meaning**: Session persistence is working
**Next Step**: Issue is with Passport authentication specifically

### Result 2: Different sessionID, no data

**Meaning**: Cookie is not being sent back to server
**Next Step**: Check CORS and cookie settings

### Result 3: Same sessionID, no data

**Meaning**: Session is not being saved properly
**Next Step**: Check session store configuration

## 🔧 Debug Information

### Check Cookie Header

Look for `cookieHeader` in the response:

- **Present**: Cookie is being sent to server
- **Missing**: Cookie is not being sent (CORS issue)

### Check SessionID Consistency

- **Same sessionID**: Cookie is working
- **Different sessionID**: Cookie is not being sent

### Check Session Data

- **Data present**: Session storage is working
- **Data missing**: Session is not being saved

## 🎯 Expected Results

1. **test-session-set should work** and return sessionID
2. **test-session-get should show** same sessionID and data
3. **Cookie header should be present** in responses
4. **Session data should persist** across requests

## 🆘 If Session Still Not Working

The issue is likely:

1. **Cookie not being set** for cross-domain
2. **CORS not allowing credentials**
3. **Cookie domain mismatch**
4. **Browser blocking third-party cookies**

We'll need to check the browser's Network tab to see if the `Set-Cookie` header is being sent and if the `Cookie` header is being sent back.
