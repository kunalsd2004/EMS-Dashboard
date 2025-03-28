import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { format } from 'date-fns';

const Header = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #FF6F61 0%, #D81B60 50%, #8E24AA 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left section with logo and title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            sx={{ 
              height: 45,
              mr: 2,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
            src="/logo1.png"
            alt="EMS Logo"
          />
        </Box>

        {/* Right section with time and profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Current Time */}
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              display: { xs: 'none', md: 'block' },
            }}
          >
            {format(new Date(), 'MMM dd, yyyy | HH:mm')}
          </Typography>

          {/* Profile */}
          <IconButton 
            color="inherit"
            sx={{ 
              '&:hover': { 
                background: 'rgba(255,255,255,0.1)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;