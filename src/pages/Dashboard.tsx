import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { GoogleMap, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
import { Report } from '../types/types';

const Dashboard = () => {
  const [activeSosCount, setActiveSosCount] = useState<number | null>(null);
  const [reportsCount, setReportsCount] = useState(0);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active SOS alerts
    const sosQuery = query(collection(db, 'sos'), where('status', '==', 'pending'));
    const unsubscribeSos = onSnapshot(sosQuery, (querySnapshot) => {
      setActiveSosCount(querySnapshot.size > 0 ? querySnapshot.size : null);
    });

    // Fetch reports count
    const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribeReports = onSnapshot(reportsQuery, (querySnapshot) => {
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData as Report[]);
      setReportsCount(querySnapshot.size);
      setLoading(false);
    });

    return () => {
      unsubscribeSos();
      unsubscribeReports();
    };
  }, []);

  useEffect(() => {
    // Calculate total incidents
    setTotalIncidents(reportsCount + (activeSosCount || 0));
  }, [reportsCount, activeSosCount]);

  const center = {
    lat: 18.531577, // Default center latitude
    lng: 73.866348  // Default center longitude
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Dashboard Overview</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6">Active SOS Alerts</Typography>
          <Typography variant="h4" color={activeSosCount && activeSosCount > 0 ? "green" : "red"}>
            {activeSosCount !== null ? (activeSosCount > 0 ? activeSosCount : "No Active Alerts") : "Loading..."}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">Today's Reports</Typography>
          <Typography variant="h4">{reportsCount}</Typography>
        </Box>
        <Box>
          <Typography variant="h6">Total Incidents</Typography>
          <Typography variant="h4">{totalIncidents}</Typography>
        </Box>
      </Box>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={{ height: '400px', width: '100%' }}
            center={center}
            zoom={13}
          >
            <MarkerClusterer>
              {(clusterer) => (
                <>
                  {reports.map((report) => (
                    <Marker
                      key={report.id}
                      position={{ lat: report.location.latitude, lng: report.location.longitude }}
                      clusterer={clusterer}
                      title={`Report: ${report.severity}`}
                      icon={{
                        url: report.type === 'sos' 
                          ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png" 
                          : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      }}
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
          </GoogleMap>
        </LoadScript>
      )}
    </Box>
  );
};

export default Dashboard; 