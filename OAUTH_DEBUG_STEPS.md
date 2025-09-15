# OAuth Debug Steps

## Issue

OAuth callback is not receiving token and user data parameters. The frontend shows:

```
OAuth callback received: {token: false, userData: false}
```

## Debug Steps

### 1. Check Backend Configuration

Visit: `https://ai-test-case-backend.onrender.com/api/auth/debug`

This will show:

- `corsOrigin` - Frontend URL being used
- `frontendUrl` - Environment variable value
- `githubCallbackUrl` - OAuth callback URL
- `environment` - Production/development mode

### 2. Test OAuth Flow Step by Step

#### Step 1: Test Login Initiation

Visit: `https://ai-test-case-backend.onrender.com/api/auth/login`

Should redirect to GitHub for authorization.

#### Step 2: Check GitHub Authorization

After clicking "Authorize" on GitHub, you should be redirected to:
`https://ai-test-case-backend.onrender.com/api/auth/callback?code=...`

#### Step 3: Check Backend Logs

Look at Render logs to see:

- OAuth success message with redirect URL
- Token length and user data length
- Any errors during the process

#### Step 4: Check Final Redirect

The backend should redirect to:
`https://ai-test-case-nu.vercel.app/auth/callback?token=...&user=...`

### 3. Common Issues and Solutions

#### Issue 1: Wrong Frontend URL

**Symptom**: Backend redirects to wrong URL
**Solution**: Check `FRONTEND_URL` environment variable in Render

#### Issue 2: URL Encoding Issues

**Symptom**: Parameters get corrupted in URL
**Solution**: Check if JWT token or user data is too long

#### Issue 3: CORS Issues

**Symptom**: Redirect doesn't reach frontend
**Solution**: Verify CORS configuration

### 4. Manual Test

You can manually test by visiting:
`https://ai-test-case-nu.vercel.app/auth/callback?token=test&user={"id":"123","username":"test"}`

This should trigger the OAuth callback handling.

## Next Steps

1. **Check the debug endpoint** first
2. **Test the OAuth flow** step by step
3. **Check Render logs** for any errors
4. **Verify the final redirect URL** contains the parameters

Let me know what you find in the debug endpoint and logs!
