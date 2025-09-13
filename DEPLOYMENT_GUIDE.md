# 🚀 Complete Deployment Guide: Test Case Generator

This guide will help you deploy your Test Case Generator application with:

- **Backend**: Deployed on Render
- **Frontend**: Deployed on Vercel

## 📋 Prerequisites

- GitHub account with your code repository
- Render account (free tier available)
- Vercel account (free tier available)
- GitHub OAuth App credentials
- Gemini API key (or your preferred AI service)

## 🔧 Step-by-Step Deployment

### Part 1: Backend Deployment on Render

#### 1.1 Prepare Your Repository

1. Push all your code to GitHub (including the new files we created)
2. Make sure your `backend/` folder is at the root level

#### 1.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `test-case-generator-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### 1.3 Set Environment Variables in Render

Go to your service → Environment tab and add:

```
NODE_ENV=production
PORT=10000
SESSION_SECRET=your_very_secure_session_secret_key_here
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
GITHUB_CALLBACK_URL=https://your-backend-app-name.onrender.com/api/auth/callback
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://your-frontend-app-name.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Replace `your-backend-app-name` with your actual Render app name.

#### 1.4 Deploy

Click "Create Web Service" and wait for deployment to complete.

### Part 2: Frontend Deployment on Vercel

#### 2.1 Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 2.2 Set Environment Variables in Vercel

**Option A: Via Vercel Dashboard**
Go to your project → Settings → Environment Variables and add:

```
VITE_API_URL=https://your-backend-app-name.onrender.com/api
VITE_APP_NAME=TestCase Generator
VITE_APP_VERSION=1.0.0
```

**Option B: Via .env.local file**
Update the `frontend/.env.local` file with your actual backend URL:

```
VITE_API_URL=https://your-backend-app-name.onrender.com/api
VITE_APP_NAME=TestCase Generator
VITE_APP_VERSION=1.0.0
```

**Important**: Replace `your-backend-app-name` with your actual Render app name.

#### 2.3 Deploy

Click "Deploy" and wait for deployment to complete.

### Part 3: GitHub OAuth Configuration

#### 3.1 Create Production OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `Test Case Generator (Production)`
   - **Homepage URL**: `https://your-frontend-app-name.vercel.app`
   - **Authorization callback URL**: `https://your-backend-app-name.onrender.com/api/auth/callback`

#### 3.2 Update Environment Variables

Use the new Client ID and Client Secret in your Render environment variables.

### Part 4: Update URLs in Configuration Files

#### 4.1 Update Backend CORS Configuration

In `backend/src/config/database.js`, replace:

```javascript
origin: process.env.NODE_ENV === "production"
  ? [process.env.FRONTEND_URL, "https://your-frontend-app-name.vercel.app"]
  : process.env.FRONTEND_URL || "http://localhost:5173",
```

Replace `your-frontend-app-name` with your actual Vercel app name.

#### 4.2 Update Production Environment Files

Update these files with your actual URLs:

- `backend/.env.production`
- `frontend/.env.production`

## 🔍 Testing Your Deployment

### 1. Test Backend

Visit: `https://your-backend-app-name.onrender.com/health`
You should see a JSON response with status "healthy".

### 2. Test Frontend

Visit: `https://your-frontend-app-name.vercel.app`
Your app should load and be able to communicate with the backend.

### 3. Test OAuth Flow

1. Click "Login with GitHub" on your frontend
2. Complete the GitHub OAuth flow
3. Verify you're redirected back to your app

## 🛠️ Troubleshooting

### Common Issues:

#### CORS Errors

- Ensure your frontend URL is correctly set in backend CORS configuration
- Check that both URLs use HTTPS in production
- Verify the CORS origin array includes your exact Vercel URL

#### OAuth Callback Issues

- Ensure GitHub OAuth app callback URL exactly matches your backend URL
- Check that the callback URL uses HTTPS
- Verify the callback path is `/api/auth/callback`

#### Environment Variable Issues

- Double-check all environment variables are set correctly
- Ensure no trailing slashes in URLs
- Verify API keys are valid and have proper permissions

#### Build Issues

- Check that all dependencies are in `package.json`
- Ensure build commands are correct
- Verify Node.js version compatibility

### Debug Steps:

1. Check Render logs for backend issues
2. Check Vercel build logs for frontend issues
3. Use browser developer tools to check network requests
4. Verify all URLs are accessible and return expected responses

## 📝 Important Notes

- **Free Tier Limitations**: Both Render and Vercel free tiers have limitations (e.g., Render free tier apps sleep after 15 minutes of inactivity)
- **Environment Variables**: Never commit sensitive environment variables to your repository
- **HTTPS**: Always use HTTPS URLs in production
- **Monitoring**: Set up monitoring and logging for production use
- **Backup**: Keep backups of your environment variable values

## 🎉 Success!

Once everything is deployed and working:

1. Your backend will be accessible at: `https://your-backend-app-name.onrender.com`
2. Your frontend will be accessible at: `https://your-frontend-app-name.vercel.app`
3. Users can log in with GitHub and generate test cases
4. All API calls will work seamlessly between frontend and backend

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Render and Vercel documentation
3. Check your application logs for specific error messages
4. Ensure all environment variables are correctly set
