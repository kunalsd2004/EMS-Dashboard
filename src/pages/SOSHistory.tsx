import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Box, Typography, Paper } from '@mui/material';

const SOSHistory = () => {
  const [sosAlerts, setSosAlerts] = useState([]);

  useEffect(() => {
    const sosQuery = collection(db, 'sos_alerts');
    const unsubscribe = onSnapshot(sosQuery, (querySnapshot) => {
      const alertsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSosAlerts(alertsData as any);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">SOS Alert History</Typography>
      {sosAlerts.map((alert: any) => (
        <Paper key={alert.id} elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography>Location: {alert.location.latitude}, {alert.location.longitude}</Typography>
          <Typography>Timestamp: {new Date(alert.timestamp.seconds * 1000).toLocaleString()}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default SOSHistory;
