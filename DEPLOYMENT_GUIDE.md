# EMS Dashboard Deployment Guide

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn**
3. **Git** account
4. **Vercel** account (free tier available)
5. **Google Analytics** account

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Project

1. Navigate to the EMS-Dashboard directory:
   ```bash
   cd EMS-Dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Test locally:
   ```bash
   npm start
   ```

### Step 2: Deploy Using Vercel CLI

#### Windows:
```bash
deploy-vercel.bat
```

#### Linux/Mac:
```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

#### Manual Deployment:
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Step 3: Configure Environment Variables

1. Go to your Vercel dashboard
2. Select your EMS Dashboard project
3. Go to Settings > Environment Variables
4. Add the following variables:

   **Required:**
   - `REACT_APP_GA_MEASUREMENT_ID`: Your Google Analytics Measurement ID

   **Optional (if using Firebase):**
   - `REACT_APP_FIREBASE_API_KEY`: Your Firebase API key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `REACT_APP_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
   - `REACT_APP_FIREBASE_APP_ID`: Your Firebase app ID

### Step 4: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

## Option 2: Deploy to Netlify

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the `build` folder
3. Or connect your GitHub repository

### Step 3: Configure Environment Variables
1. Go to Site settings > Environment variables
2. Add your Google Analytics Measurement ID

## Option 3: Deploy to GitHub Pages

### Step 1: Add GitHub Pages Script
Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

### Step 3: Deploy
```bash
npm run deploy
```

## Option 4: Deploy to Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Initialize Firebase
```bash
firebase login
firebase init hosting
```

### Step 3: Build and Deploy
```bash
npm run build
firebase deploy
```

## Post-Deployment Setup

### 1. Google Analytics Configuration

1. Follow the [Google Analytics Setup Guide](./GOOGLE_ANALYTICS_SETUP.md)
2. Set up your Measurement ID in environment variables
3. Test that analytics are working

### 2. SSL Certificate

All recommended platforms (Vercel, Netlify, Firebase) provide free SSL certificates automatically.

### 3. Performance Optimization

The dashboard is already optimized with:
- Code splitting
- Lazy loading
- Optimized images
- Minified bundles

### 4. Monitoring

Set up monitoring for:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry)
- Performance monitoring (Google Analytics)

## Environment-Specific Configurations

### Development Environment
```bash
# .env.development
REACT_APP_GA_MEASUREMENT_ID=G-DEVXXXXXXXX
REACT_APP_ENVIRONMENT=development
```

### Production Environment
```bash
# .env.production
REACT_APP_GA_MEASUREMENT_ID=G-PRODXXXXXXXX
REACT_APP_ENVIRONMENT=production
```

## Troubleshooting

### Build Errors
1. Check Node.js version: `node --version`
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Deployment Errors
1. Check environment variables are set correctly
2. Verify all dependencies are in package.json
3. Check build logs for specific errors

### Analytics Not Working
1. Verify Measurement ID is correct
2. Check browser console for errors
3. Ensure no ad blockers are active
4. Test in incognito mode

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly if using APIs
4. **Content Security Policy**: Consider adding CSP headers

## Performance Optimization

### Build Optimization
- The project uses Create React App's built-in optimizations
- Images are optimized automatically
- Code splitting is enabled

### Runtime Optimization
- Lazy loading for components
- Efficient re-rendering with React hooks
- Optimized Material-UI components

## Backup and Recovery

### Code Backup
1. Use Git for version control
2. Push to GitHub/GitLab
3. Set up automated backups

### Data Backup
1. Export Firebase data regularly
2. Backup Google Analytics data
3. Document configuration settings

## Support and Maintenance

### Regular Maintenance
1. Update dependencies monthly
2. Monitor analytics data
3. Check for security updates
4. Review performance metrics

### Support Resources
- [React Documentation](https://reactjs.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Google Analytics Help](https://support.google.com/analytics)

## Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Netlify**: 100GB bandwidth/month, unlimited builds
- **Firebase**: 10GB storage, 1GB/day database reads
- **Google Analytics**: Free for most use cases

### Paid Plans (if needed)
- **Vercel Pro**: $20/month for more bandwidth
- **Netlify Pro**: $19/month for more features
- **Firebase Blaze**: Pay-as-you-go for high usage

## Next Steps

After deployment:
1. Set up Google Analytics tracking
2. Configure monitoring and alerts
3. Set up backup procedures
4. Create user documentation
5. Plan for scaling as usage grows 