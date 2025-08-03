@echo off
echo ========================================
echo EMS Dashboard Simple Deployment
echo ========================================

echo.
echo Step 1: Installing dependencies...
npm install

echo.
echo Step 2: Building the project...
npm run build

echo.
echo Step 3: Deploying to Vercel...
echo Note: You'll need to login to Vercel if not already logged in
vercel --prod

echo.
echo ========================================
echo Deployment completed!
echo ========================================
echo.
echo Next steps:
echo 1. Set up Google Analytics (follow GOOGLE_ANALYTICS_SETUP.md)
echo 2. Configure environment variables in Vercel dashboard:
echo    - REACT_APP_GA_MEASUREMENT_ID (for Google Analytics)
echo    - REACT_APP_GOOGLE_MAPS_API_KEY (for maps functionality)
echo 3. Test your deployed dashboard
echo.
pause 