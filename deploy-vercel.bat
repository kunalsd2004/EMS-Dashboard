@echo off
echo Starting EMS Dashboard deployment to Vercel...

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Install dependencies
echo Installing dependencies...
npm install

REM Build the project
echo Building the project...
npm run build

REM Deploy to Vercel
echo Deploying to Vercel...
vercel --prod

echo Deployment completed!
echo Your dashboard is now live at the URL shown above.
echo Don't forget to set up your Google Analytics Measurement ID in Vercel environment variables. 