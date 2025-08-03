# Google Analytics Setup Guide for EMS Dashboard

## Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Follow the setup wizard to create your account
4. Choose "Web" as your data stream type
5. Enter your website details:
   - Website name: "EMS Dashboard"
   - Website URL: Your deployed dashboard URL
   - Industry category: "Technology"
   - Business size: "Small business"

## Step 2: Get Your Measurement ID

1. After creating your property, you'll get a Measurement ID
2. It will look like: `G-XXXXXXXXXX`
3. Copy this ID - you'll need it for the next steps

## Step 3: Configure Environment Variables

### For Local Development:
1. Create a `.env` file in the EMS-Dashboard directory
2. Add your Measurement ID:
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your EMS Dashboard project
3. Go to Settings > Environment Variables
4. Add a new variable:
   - Name: `REACT_APP_GA_MEASUREMENT_ID`
   - Value: Your Measurement ID (e.g., `G-XXXXXXXXXX`)
   - Environment: Production (and Preview if needed)

## Step 4: Test Analytics

1. Deploy your dashboard
2. Visit your dashboard URL
3. Go to Google Analytics > Reports > Realtime
4. You should see your dashboard as an active user
5. Check the "Events" section to see tracked interactions

## Step 5: Set Up Custom Events (Optional)

The dashboard is already configured to track:
- Page views
- User interactions
- Dashboard section views
- SOS alerts
- Report generation
- Map interactions
- User authentication

## Step 6: Create Custom Reports

### User Engagement Report:
1. Go to Google Analytics > Reports > Engagement
2. Create a custom report for:
   - Page views by section
   - User interactions
   - Time on page

### Emergency Response Report:
1. Create a custom report for:
   - SOS alerts by type
   - Response times
   - Geographic distribution

## Step 7: Set Up Goals

1. Go to Admin > Goals
2. Create goals for:
   - Dashboard visits (Destination goal)
   - User registration (Event goal)
   - Report generation (Event goal)

## Step 8: Enable Enhanced Ecommerce (Optional)

If you plan to add features like premium subscriptions:
1. Go to Admin > Ecommerce settings
2. Enable Enhanced Ecommerce
3. Configure product tracking

## Troubleshooting

### Analytics Not Working?
1. Check browser console for errors
2. Verify Measurement ID is correct
3. Ensure no ad blockers are active
4. Check if gtag is loaded in Network tab

### No Data Showing?
1. Wait 24-48 hours for data to appear
2. Check if you're in the correct Google Analytics property
3. Verify the Measurement ID matches your property

## Useful Analytics Metrics

### Dashboard Performance:
- Page views per day/week/month
- Average session duration
- Bounce rate
- Most visited sections

### User Behavior:
- User flow through dashboard
- Drop-off points
- Feature usage patterns
- Device and browser statistics

### Emergency Response:
- SOS alert frequency
- Response time metrics
- Geographic hotspots
- Alert resolution rates

## Security Considerations

1. **GDPR Compliance**: Ensure you have user consent for analytics
2. **Data Retention**: Set appropriate data retention periods
3. **IP Anonymization**: Enable IP anonymization for privacy
4. **User Consent**: Add a cookie consent banner if needed

## Advanced Configuration

### Custom Dimensions:
The dashboard tracks:
- `user_type`: Type of user (admin, responder, etc.)
- `page_section`: Which section of the dashboard

### Custom Metrics:
- Response time
- Alert frequency
- User engagement score

## Support

For issues with Google Analytics setup:
1. Check [Google Analytics Help](https://support.google.com/analytics)
2. Review the [gtag.js documentation](https://developers.google.com/analytics/devguides/collection/gtagjs)
3. Contact your development team for technical issues 