# GitHub OAuth Setup for Production

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the following details:

### For Development (if not already done):

- **Application name**: `Test Case Generator (Dev)`
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:5000/api/auth/callback`

### For Production:

- **Application name**: `Test Case Generator (Production)`
- **Homepage URL**: `https://your-frontend-app-name.vercel.app`
- **Authorization callback URL**: `https://your-backend-app-name.onrender.com/api/auth/callback`

## Step 2: Get Credentials

After creating the OAuth app, you'll get:

- **Client ID**: Copy this value
- **Client Secret**: Click "Generate a new client secret" and copy the value

## Step 3: Update Environment Variables

### Backend (Render):

Update these environment variables in your Render dashboard:

```
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_CALLBACK_URL=https://your-backend-app-name.onrender.com/api/auth/callback
```

### Frontend (Vercel):

Update these environment variables in your Vercel dashboard:

```
VITE_API_URL=https://your-backend-app-name.onrender.com/api
```

## Step 4: Update GitHub OAuth App Settings

1. Go back to your GitHub OAuth app settings
2. Update the **Authorization callback URL** to your production backend URL
3. Save the changes

## Important Notes:

- Keep your Client Secret secure and never commit it to version control
- The callback URL must exactly match what you set in GitHub OAuth app settings
- Make sure to use HTTPS URLs for production
- Test the OAuth flow after deployment to ensure everything works correctly
