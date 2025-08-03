import React, { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Badge,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warning as SOSIcon,
  Report as ReportIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { trackDashboardSection, trackUserInteraction } from '../utils/googleAnalytics';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSOSCount, setActiveSOSCount] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'sos_alerts'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveSOSCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { 
      text: 'SOS Alerts', 
      icon: (
        <Badge badgeContent={activeSOSCount} color="error">
          <SOSIcon />
        </Badge>
      ), 
      path: '/sos-alerts' 
    },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          background: 'linear-gradient(#FFFFFF, #2E2E2E, #4A90E2 100%)',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar sx={{ 
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #ff4081 30%, #ff9100 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            EMS Dashboard
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              trackDashboardSection(item.text);
              trackUserInteraction('navigation', { section: item.text, path: item.path });
            }}
            selected={location.pathname === item.path}
            sx={{
              mb: 1,
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: location.pathname === item.path ? 
                'linear-gradient(45deg, rgba(255,64,129,0.2) 30%, rgba(255,145,0,0.2) 90%)' : 
                'transparent',
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(255,64,129,0.15) 30%, rgba(255,145,0,0.15) 90%)',
                transform: 'translateX(8px)',
                '& .MuiListItemIcon-root': {
                  transform: 'scale(1.2)',
                },
              },
              '& .MuiListItemIcon-root': {
                transition: 'transform 0.3s ease',
                color: location.pathname === item.path ? '#ff4081' : 'rgba(255,255,255,0.7)',
              },
              '& .MuiListItemText-primary': {
                color: location.pathname === item.path ? '#ffffff' : 'rgba(255,255,255,0.7)',
                fontWeight: location.pathname === item.path ? 600 : 400,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
              },
              '& .MuiBadge-badge': {
                background: 'linear-gradient(45deg, #ff4081 30%, #ff9100 90%)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '0.95rem',
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Emergency Contact Footer */}
      <Box sx={{ 
        mt: 'auto', 
        p: 2, 
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
      }}>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.7)',
          display: 'block',
          textAlign: 'center',
          fontSize: '0.75rem'
        }}>
          Emergency Contact
        </Typography>
        <Typography variant="body2" sx={{ 
          color: '#ff4081',
          fontWeight: 600,
          textAlign: 'center',
          fontSize: '1.1rem'
        }}>
          112
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;