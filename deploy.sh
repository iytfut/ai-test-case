#!/bin/bash

# Test Case Generator - Quick Deployment Script
# This script helps you prepare and deploy your application

echo "🚀 Test Case Generator Deployment Helper"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure looks good!"

# Check for required files
echo "📋 Checking deployment files..."

required_files=(
    "backend/render.yaml"
    "backend/.env.production"
    "frontend/vercel.json"
    "frontend/.env.production"
    "backend/src/middleware/cors.js"
    "DEPLOYMENT_GUIDE.md"
    "GITHUB_OAUTH_SETUP.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

echo ""
echo "📝 Next Steps:"
echo "1. Update the URLs in the following files with your actual app names:"
echo "   - backend/.env.production"
echo "   - frontend/.env.production"
echo "   - backend/src/middleware/cors.js"
echo "   - backend/src/config/database.js"
echo ""
echo "2. Set up GitHub OAuth app (see GITHUB_OAUTH_SETUP.md)"
echo ""
echo "3. Deploy backend on Render (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "4. Deploy frontend on Vercel (see DEPLOYMENT_GUIDE.md)"
echo ""
echo "5. Test your deployment!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
