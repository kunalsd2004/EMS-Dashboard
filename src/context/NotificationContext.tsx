"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useCallback } from "react";
import { notificationSound } from "../utils/notificationSound";
import { Snackbar, Alert, IconButton, Box, Typography, Slide } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

type NotificationType = "success" | "info" | "warning" | "error";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  link?: string;
  sound?: "sos" | "report" | "info";
  read?: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null | undefined>();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastPlayedNotificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    notificationSound.requestNotificationPermission();
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setCurrentNotification(newNotification);
  }, []);

  // Play sound when a new notification is received
  useEffect(() => {
    if (
      notifications.length > 0 &&
      notifications[0].id !== lastPlayedNotificationIdRef.current &&
      soundEnabled &&
      (notifications[0].sound === "sos" || notifications[0].sound === "report")
    ) {
      notificationSound.play(notifications[0].sound, notifications[0].message);
      lastPlayedNotificationIdRef.current = notifications[0].id;
    }
  }, [notifications.length, soundEnabled]); // Only depend on length and soundEnabled

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleSound = useCallback(() => {
    const newState = notificationSound.toggle();
    setSoundEnabled(newState);
  }, []);

  const handleClose = useCallback(() => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
      setCurrentNotification(null);
    }
  }, [currentNotification, markAsRead]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        clearAll,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}

      <Box
        sx={{
          position: "fixed",
          top: "70px",
          right: "20px",
          zIndex: 1300,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <IconButton
          onClick={toggleSound}
          color="primary"
          aria-label={soundEnabled ? "Disable notification sounds" : "Enable notification sounds"}
        >
          {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
        </IconButton>
      </Box>

      {currentNotification && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          TransitionComponent={Slide} 
        >
          <Alert onClose={handleClose} severity={currentNotification.type} sx={{ width: "100%" }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {currentNotification.title}
            </Typography>
            <Typography variant="body2">{currentNotification.message}</Typography>
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
};
