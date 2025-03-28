# EMS Dashboard

## Overview
The EMS Dashboard is the administrative interface of the Emergency Management System, designed for emergency response teams and administrators to monitor and manage emergency situations in real-time. It provides a comprehensive view of all incidents, SOS alerts, and emergency reports submitted through the EMS mobile application.

## Key Features

### 1. Real-time Emergency Monitoring
- **Live SOS Alerts**
  - Instant notification of emergency situations
  - Real-time location tracking of incidents
  - Priority-based alert system

- **Interactive Map View**
  - Real-time incident mapping
  - Cluster view for multiple incidents
  - Location-based filtering

### 2. Report Management System
- View and process accident reports
- Track emergency response status
- Manage incident documentation
- Generate detailed incident reports

### 3. Analytics Dashboard
- **Statistical Analysis**
  - Emergency response time metrics
  - Incident frequency analysis
  - Geographic distribution of emergencies
  
- **Performance Metrics**
  - Response time tracking
  - Resource utilization stats
  - Team performance analytics

### 4. User Management
- Manage emergency response teams
- Track team locations and availability
- Role-based access control

## Technical Details

### Technology Stack
- **Frontend Framework:** React.js
- **UI Library:** Material-UI
- **State Management:** React Context API
- **Maps Integration:** Google Maps API
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Real-time Updates:** Firebase Real-time Database
- **Analytics:** Firebase Analytics

### System Requirements
- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection

## Getting Started

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd EMS-Dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the development server:
```bash
npm start
```

### Build for Production
```bash
npm run build
```

## Project Structure
```
EMS-Dashboard/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Main application pages
│   ├── context/       # React context providers
│   ├── config/        # Configuration files
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── package.json       # Project dependencies
```

## Available Scripts
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Security Considerations
- Implement proper authentication checks
- Use environment variables for sensitive data
- Regular security audits
- API key restrictions
- Data encryption in transit and at rest

## Best Practices
- Follow React best practices
- Use TypeScript for type safety
- Implement error boundaries
- Regular code reviews
- Maintain consistent code style
- Write unit tests for critical components

## Troubleshooting
Common issues and solutions:
1. **Firebase Connection Issues**
   - Check Firebase credentials
   - Verify network connectivity
   - Ensure proper security rules

2. **Map Loading Issues**
   - Verify Google Maps API key
   - Check browser console for errors
   - Ensure proper API restrictions

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support
For technical support:
- Email: support@ems-dashboard.com
- Documentation: [docs-url]
- Issue Tracker: [issues-url]
 