#!/bin/bash

echo "Starting EMS Dashboard deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment completed!"
echo "Your dashboard is now live at the URL shown above."
echo "Don't forget to set up your Google Analytics Measurement ID in Vercel environment variables." 