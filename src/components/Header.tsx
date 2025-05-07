"use client";

import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, Menu, MenuItem, Tooltip } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { format } from "date-fns";
import { useNotifications } from "../context/NotificationContext";

const Header = () => {
  const { notifications, markAsRead, soundEnabled, toggleSound } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationRead = (id: string) => {
    markAsRead(id);
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box component="img" sx={{ height: 45, mr: 2 }} src="/logo1.png" alt="EMS Logo" />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
            {format(new Date(), "MMM dd, yyyy | HH:mm")}
          </Typography>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <MenuItem key={notification.id} onClick={() => handleNotificationRead(notification.id)}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {notification.title || "Notification"}
                  </Typography>
                  <Typography variant="body2">{notification.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </Typography>
                </MenuItem>
              ))
            )}
          </Menu>

          <Tooltip title={soundEnabled ? "Mute Notifications" : "Enable Notification Sounds"}>
            <IconButton color="inherit" onClick={toggleSound}>
              {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
          </Tooltip>

          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
