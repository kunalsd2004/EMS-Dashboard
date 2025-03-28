// src/App.jsx or your main routing file
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SOSAlerts from './components/SOSAlerts';
import Reports from './components/Reports';
import CCTVMonitoring from './components/CCTVMonitoring';
import Analytics from './components/Analytics';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sos-alerts" element={<SOSAlerts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/CCTV" element={<CCTVMonitoring />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
