import React, { useEffect } from 'react';  
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SOSAlerts from './pages/SOSAlerts';
import Reports from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { NotificationProvider } from './context/NotificationContext';
import { initializeAnalytics, trackPageView } from './utils/googleAnalytics';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF4B8C',
    },
    secondary: {
      main: '#4CD964',
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize Google Analytics
    initializeAnalytics();
    
    // Track initial page view
    trackPageView('EMS Dashboard', window.location.pathname);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <BrowserRouter>
          <Box sx={{ display: 'flex' }}>
            <Header />
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                ml: '240px', // Adjust this if your sidebar width changes
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sos-alerts" element={<SOSAlerts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/analytics" element={<Analytics />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;