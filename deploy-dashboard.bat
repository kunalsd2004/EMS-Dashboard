@echo off
echo 🌐 EMS Dashboard Deployment Script
echo ==================================

echo 📦 Installing dependencies...
npm install

echo 🔨 Building for production...
npm run build

echo 🚀 Deploying to Vercel...
echo.
echo 📋 If Vercel CLI is not installed, run:
echo npm install -g vercel
echo.
echo 📋 Then run: vercel --prod
echo.

pause 