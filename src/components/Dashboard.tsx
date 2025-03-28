import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { SOSAlert, Report } from '../types/types';
import { useNotifications } from '../context/NotificationContext';

const Dashboard = () => {
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({ open: false, message: '', type: 'success' });
  const [error, setError] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  const handleError = useCallback((error: Error) => {
    console.error('Dashboard Error:', error);
    setError(error.message);
    setNotification({
      open: true,
      message: 'An error occurred. Please try again.',
      type: 'error'
    });
  }, []);

  useEffect(() => {
    try {
      // Listen for SOS Alerts
      const sosQuery = query(
        collection(db, 'sos_alerts'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const unsubscribeSOS = onSnapshot(sosQuery, 
        (snapshot) => {
          try {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();
              }
            });

            const alerts = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                location: {
                  latitude: data.location?.latitude ?? 0,
                  longitude: data.location?.longitude ?? 0
                },
                contact: data.contact ?? 'Unknown',
                status: data.status ?? 'active',
                timestamp: data.timestamp?.toDate() ?? new Date(),
              } as unknown as SOSAlert;
            });
            setSOSAlerts(alerts);
          } catch (err) {
            handleError(err instanceof Error ? err : new Error('Unknown error'));
          }
        },
        (err) => handleError(err)
      );

      // Listen for Reports
      const reportsQuery = query(
        collection(db, 'reports'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const unsubscribeReports = onSnapshot(reportsQuery, 
        (snapshot) => {
          try {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const data = change.doc.data();

                // Add to notification system
                addNotification({
                  message: `New ${data.type || 'Unknown'} Report - Severity: ${data.severity || 'Unknown'}`,
                  type: 'warning',
                  title: 'New Incident Report',
                  link: `/reports/${change.doc.id}` // Link to the report detail page
                });
              }
            });

            const reportsData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                type: data.type ?? 'Unknown',
                severity: data.severity ?? 'Low',
                location: {
                  latitude: data.location?.latitude ?? 0,
                  longitude: data.location?.longitude ?? 0
                },
                contact: data.contact ?? 'Unknown',
                status: data.status ?? 'pending',
                timestamp: data.timestamp?.toDate() ?? new Date(),
                image: data.image ?? '',
                userId: data.userId ?? '',
              } as Report;
            });
            setReports(reportsData);
          } catch (err) {
            handleError(err instanceof Error ? err : new Error('Unknown error'));
          }
        },
        (err) => handleError(err)
      );

      return () => {
        unsubscribeSOS();
        unsubscribeReports();
      };
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [handleError, addNotification]);

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        alignItems: 'center',
        justifyContent: 'center', // Added this
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Typography 
          variant="h4" 
          align="center"
          gutterBottom 
          sx={{ 
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontWeight: 600,
            mb: 4
          }}
        >
          Dashboard Overview
        </Typography>
        
        <Grid 
          container 
          spacing={3} 
          justifyContent="center" // Added this
          sx={{ 
            margin: '0 auto'
          }}
        >
          {/* Summary Cards */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            
            <Paper 
              elevation={8}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                background: sosAlerts.some(alert => alert.status === 'active') 
                  ? 'linear-gradient(to right bottom, rgba(255,205,210,0.95), rgba(255,235,238,0.95))'
                  : 'linear-gradient(to right bottom, rgba(255,255,255,0.95), rgba(240,240,240,0.95))',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
                }
              }}
            >
              <Typography variant="h6" sx={{ color: '#1a2a6c', fontWeight: 600 }}>Active SOS Alerts</Typography>
              <Typography variant="h3" color="error" sx={{ fontWeight: 700 }}>
                {sosAlerts.filter(alert => alert.status === 'active').length}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper 
              elevation={8}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(240,240,240,0.9))',
                backdropFilter: 'blur(5px)',
                borderRadius: '15px',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" sx={{ color: '#1a2a6c', fontWeight: 600 }}>Today's Reports</Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                {reports.filter(report => 
                  report.timestamp?.toDateString() === new Date().toDateString()
                ).length}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper 
              elevation={8}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(240,240,240,0.9))',
                backdropFilter: 'blur(5px)',
                borderRadius: '15px',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" sx={{ color: '#1a2a6c', fontWeight: 600 }}>Total Incidents</Typography>
              <Typography variant="h3" sx={{ color: '#1a2a6c', fontWeight: 700 }}>
                {reports.length + sosAlerts.length}
              </Typography>
            </Paper>
          </Grid>

          {/* Recent Alerts and Reports Container */}
          <Grid item xs={12}>
            <Grid container spacing={3} sx={{ mt: 2 }} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={8}
                  sx={{ 
                    p: 4,
                    background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(240,240,240,0.9))',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                      color: '#1a2a6c', 
                      fontWeight: 600,
                      mb: 3,
                      borderBottom: '2px solid rgba(26,42,108,0.1)',
                      pb: 2
                    }}
                  >
                    Recent SOS Alerts
                  </Typography>
                  <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                    {sosAlerts.slice(0, 5).map((alert) => (
                      <Paper 
                        key={alert.id} 
                        elevation={4}
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          background: alert.status === 'active' 
                            ? 'linear-gradient(to right, rgba(255,235,238,0.9), rgba(255,205,210,0.9))'
                            : 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(250,250,250,0.9))',
                          borderRadius: '10px',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <Typography sx={{ fontWeight: 500 }}><strong>Status:</strong> {alert.status}</Typography>
                        <Typography sx={{ fontWeight: 500 }}><strong>Contact:</strong> {alert.contact}</Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          <strong>Location:</strong> {
                            alert.location 
                              ? `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`
                              : 'Location not available'
                          }
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          <strong>Time:</strong> {alert.timestamp?.toLocaleString() ?? 'Time not available'}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={8}
                  sx={{ 
                    p: 4,
                    background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(240,240,240,0.9))',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    align="center"
                    sx={{ 
                      color: '#1a2a6c', 
                      fontWeight: 600,
                      mb: 3,
                      borderBottom: '2px solid rgba(26,42,108,0.1)',
                      pb: 2
                    }}
                  >
                    Recent Reports
                  </Typography>
                  <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
                    {reports.slice(0, 5).map((report) => (
                      <Paper 
                        key={report.id} 
                        elevation={4}
                        sx={{ 
                          p: 2, 
                          mb: 2, 
                          background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(250,250,250,0.9))',
                          borderRadius: '10px',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        <Typography sx={{ fontWeight: 500 }}><strong>Type:</strong> {report.type}</Typography>
                        <Typography sx={{ fontWeight: 500 }}><strong>Severity:</strong> {report.severity}</Typography>
                        <Typography sx={{ fontWeight: 500 }}><strong>Status:</strong> {report.status}</Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          <strong>Location:</strong> {
                            report.location 
                              ? `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`
                              : 'Location not available'
                          }
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          <strong>Time:</strong> {report.timestamp?.toLocaleString() ?? 'Time not available'}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    </Box>

    {/* Error Notification */}
    <Snackbar 
      open={Boolean(error)} 
      autoHideDuration={6000} 
      onClose={() => setError(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setError(null)} 
        severity="error" 
        sx={{ width: '100%' }}
      >
        {error || 'An error occurred'}
      </Alert>
    </Snackbar>

    {/* Notifications */}
    <Snackbar 
      open={notification.open} 
      autoHideDuration={6000} 
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleCloseNotification} 
        severity={notification.type} 
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>

  </Box>
  );
};

export default Dashboard;