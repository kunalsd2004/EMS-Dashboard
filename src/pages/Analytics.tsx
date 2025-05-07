import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent } from '@mui/material';
import { collection, query, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getLocationName } from '../utils/geocoding';





// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Analytics = () => {
  interface LocationData {
    [key: string]: { sos: number; accidents: number };
  }

  const [reportLocations, setReportLocations] = useState<string[]>([]);

  const fetchReportLocations = async () => {
    try {
      const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(reportsQuery);
      const locations = new Set<string>();

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.location) {
          const locationName = await getLocationName(
            data.location.latitude ?? 0,
            data.location.longitude ?? 0
          );
          if (locationName) locations.add(locationName);
        }
      }
      setReportLocations(Array.from(locations));
    } catch (error) {
      console.error('Error fetching report locations:', error);
    }
  };

  interface LocationStats {
    [key: string]: {
      accidents: number;
      sos: number;
      timeData: {
        daily: { [date: string]: { accidents: number; sos: number } };
        weekly: { [week: string]: { accidents: number; sos: number } };
        monthly: { [month: string]: { accidents: number; sos: number } };
      };
    };
  }

  const [reportData, setReportData] = useState<{
    labels: string[];
    sosData: number[];
    accidentData: number[];
    activeAlerts: number;
    resolvedAlerts: number;
    totalAlerts: number;
    locationData: LocationData;
  }>({
    labels: [],
    sosData: [],
    accidentData: [],
    activeAlerts: 0,
    resolvedAlerts: 0,
    totalAlerts: 0,
    locationData: {}
  });

  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [locationStats, setLocationStats] = useState<LocationStats>({});

  const [reportTypes, setReportTypes] = useState<string[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>("");
  const [filteredReports, setFilteredReports] = useState<any[]>([]);

   // Add these new functions
   const fetchReportTypes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      const uniqueTypes = new Set<string>();
      querySnapshot.forEach((doc) => {
        const type = doc.data().type;
        if (type) uniqueTypes.add(type);
      });
      setReportTypes(Array.from(uniqueTypes));
    } catch (error) {
      console.error("Error fetching report types:", error);
    }
  };
  

  useEffect(() => {
    fetchReportLocations();
    const fetchAllData = async () => {
      try {
        const sosQuery = query(collection(db, 'sos_alerts'), orderBy('timestamp', 'desc'));
        const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const archiveQuery = query(collection(db, 'analytics_archive'), orderBy('timestamp', 'desc'));

        // Create subscriptions
        const unsubscribeSos = onSnapshot(sosQuery, (sosSnapshot) => {
          processData(sosSnapshot.docs, 'sos');
        });

        const unsubscribeReports = onSnapshot(reportsQuery, (reportsSnapshot) => {
          processData(reportsSnapshot.docs, 'reports');
        });

        const unsubscribeArchive = onSnapshot(archiveQuery, (archiveSnapshot) => {
          archiveSnapshot.docs.forEach(doc => {
            const data = doc.data();
            processData([{
              ...doc,
              data: () => ({
                ...data,
                timestamp: data.timestamp?.toDate() || new Date(),
              })
            }], data.type || 'reports');
          });
        });

        // Return cleanup function
        return () => {
          unsubscribeSos();
          unsubscribeReports();
          unsubscribeArchive();
        };
      } catch (error) {
        console.error('Error setting up data fetching:', error);
      }
    };

    fetchAllData();
  }, []);

  const processData = async (docs: any[], type: 'sos' | 'reports') => {
    try {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      if (type === 'sos') {
        const activeSOS = docs.filter(doc => doc.data().status === 'pending').length;
        const resolvedSOS = docs.filter(doc => doc.data().status === 'resolved').length;

        const sosData = last7Days.map(date => {
          return docs.filter(doc => {
            const docDate = new Date(doc.data().timestamp?.seconds * 1000).toISOString().split('T')[0];
            return docDate === date;
          }).length;
        });

        // Update location data for SOS alerts
        const locationData = { ...reportData.locationData };
        for (const doc of docs) {
          const data = doc.data();
          const locationName = await getLocationName(
            data.location?.latitude ?? 0,
            data.location?.longitude ?? 0
          );

          if (!locationData[locationName]) {
            locationData[locationName] = { sos: 0, accidents: 0 };
          }
          locationData[locationName].sos += 1;
        }

        setReportData(prev => ({
          ...prev,
          sosData,
          activeAlerts: activeSOS,
          resolvedAlerts: resolvedSOS,
          totalAlerts: docs.length,
          locationData,
          labels: last7Days.map(date => new Date(date).toLocaleDateString())
        }));
      } else {
        const accidentData = last7Days.map(date => {
          return docs.filter(doc => {
            const docDate = new Date(doc.data().timestamp?.seconds * 1000).toISOString().split('T')[0];
            return docDate === date;
          }).length;
        });

        // Update location data for accident reports
        const locationData = { ...reportData.locationData };
        for (const doc of docs) {
          const data = doc.data();
          const locationName = await getLocationName(
            data.location?.latitude ?? 0,
            data.location?.longitude ?? 0
          );

          if (!locationData[locationName]) {
            locationData[locationName] = { sos: 0, accidents: 0 };
          }
          locationData[locationName].accidents += 1;
        }

        setReportData(prev => ({
          ...prev,
          accidentData,
          locationData
        }));
      }
    } catch (error) {
      console.error('Error processing data:', error);
    }
  };

  const getWeekNumber = (date: Date): string => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(
      ((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const getFilteredData = (locationName: string = 'all') => {
    if (locationName === 'all') {
      return Object.entries(locationStats).reduce((acc, [_, stats]) => {
        Object.entries(stats.timeData[timeFilter]).forEach(([timeKey, data]) => {
          if (!acc[timeKey]) acc[timeKey] = { accidents: 0, sos: 0 };
          acc[timeKey].accidents += data.accidents;
          acc[timeKey].sos += data.sos;
        });
        return acc;
      }, {} as { [key: string]: { accidents: number; sos: number } });
    }

    return locationStats[locationName]?.timeData[timeFilter] || {};
  };

  const chartData = {
    labels: reportData.labels,
    datasets: [
      {
        label: 'SOS Alerts',
        data: reportData.sosData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4
      },
      {
        label: 'Accident Reports',
        data: reportData.accidentData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Emergency Reports Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const locationChartData = {
    labels: Object.keys(reportData.locationData),
    datasets: [
      {
        label: 'SOS Alerts',
        data: Object.values(reportData.locationData).map((data: { sos: number; accidents: number }) => data.sos),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        label: 'Accident Reports',
        data: Object.values(reportData.locationData).map((data: { sos: number; accidents: number }) => data.accidents),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      }
    ]
  };

  const locationChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Reports by Location'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Update the return JSX with enhanced styling
return (
  <Box sx={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #05445E 0%, #189AB4 50%, #75E6DA 100%)',
    p: 3,
    borderRadius: '12px',
  }}>
    <Paper sx={{
      p: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4,
          color: '#05445E',
          fontWeight: 700,
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          background: 'linear-gradient(45deg, #05445E 30%, #189AB4 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Analytics Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
        <FormControl fullWidth>
  <InputLabel sx={{ color: '#189AB4' }}>Location Filter</InputLabel>
  <Select
    value={selectedLocation}
    onChange={(e) => setSelectedLocation(e.target.value as string)}
    label="Location Filter"
    sx={{
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#189AB4',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#05445E',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#05445E',
      },
    }}
  >
    <MenuItem value="all">All Locations</MenuItem>
    {Object.keys(reportData.locationData).map((location) => (
      <MenuItem key={location} value={location}>
        {location}
      </MenuItem>
    ))}
  </Select>
</FormControl>


        </Grid>
        <Grid item xs={12} md={6}>
        <FormControl fullWidth>
  <InputLabel sx={{ color: '#189AB4' }}>Location Filter</InputLabel>
  <Select
    value={selectedLocation}
    onChange={(e) => setSelectedLocation(e.target.value as string)}
    label="Location Filter"
    sx={{
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#189AB4',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#05445E',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#05445E',
      },
    }}
  >
    <MenuItem value="all">All Locations</MenuItem>
    {reportLocations.map((location) => (
      <MenuItem key={location} value={location}>
        {location}
      </MenuItem>
    ))}
  </Select>
</FormControl>

        </Grid>
      </Grid>

      {selectedLocation !== 'all' && (
  <Card sx={{
    mb: 4,
    background: 'linear-gradient(135deg, rgba(5, 68, 94, 0.05) 0%, rgba(24, 154, 180, 0.05) 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  }}>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ color: '#05445E' }}>
        Statistics for {selectedLocation}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E8E 90%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
          }}>
            <Typography variant="subtitle2">Total Accidents</Typography>
            <Typography variant="h4">
              {reportData.locationData[selectedLocation]?.accidents || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper sx={{
            p: 2,
            background: 'linear-gradient(45deg, #4ECDC4 30%, #45B7AF 90%)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
          }}>
            <Typography variant="subtitle2">Total SOS Alerts</Typography>
            <Typography variant="h4">
              {reportData.locationData[selectedLocation]?.sos || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)}

      {/* SOS Alerts Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#05445E' }}>
          SOS Alerts Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 20px rgba(255, 65, 108, 0.2)',
            }}>
              <Typography variant="subtitle1">Active Alerts</Typography>
              <Typography variant="h3">{reportData.activeAlerts}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)',
            }}>
              <Typography variant="subtitle1">Resolved Alerts</Typography>
              <Typography variant="h3">{reportData.resolvedAlerts}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
            }}>
              <Typography variant="subtitle1">Total Alerts</Typography>
              <Typography variant="h3">{reportData.totalAlerts}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Charts with enhanced styling */}
      <Paper sx={{
        p: 3,
        mb: 4,
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      }}>
        <Line options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            title: {
              display: true,
              text: `Emergency Reports - ${selectedLocation === 'all' ? 'All Locations' : selectedLocation}`,
              color: '#05445E',
              font: {
                size: 16,
                weight: 'bold',
              }
            }
          }
        }} data={chartData} />
      </Paper>

      {/* Location Analytics with enhanced styling */}
      <Paper sx={{
        p: 3,
        mb: 4,
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#05445E' }}>
          Reports by Location
        </Typography>
        <Bar options={locationChartOptions} data={locationChartData} />
      </Paper>

      {/* Incidents Table with enhanced styling */}
      {/* Incidents Table with enhanced styling */}
<Paper sx={{
  p: 3,
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
}}>
  <Typography variant="h6" sx={{ mb: 2, color: '#05445E' }}>
    Incidents by Location
  </Typography>
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow sx={{ background: 'linear-gradient(45deg, #05445E 30%, #189AB4 90%)' }}>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Accidents</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>SOS Alerts</TableCell>
          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(reportData.locationData).map(([location, data]) => (
          <TableRow 
            key={location}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(24, 154, 180, 0.1)',
              },
            }}
          >
            <TableCell>{location}</TableCell>
            <TableCell>{data.accidents}</TableCell>
            <TableCell>{data.sos}</TableCell>
            <TableCell>{data.accidents + data.sos}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

    </Paper>
  </Box>
);
}