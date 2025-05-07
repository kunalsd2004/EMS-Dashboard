"use client"

import { useEffect, useState } from "react"
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material"
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "../config/firebaseConfig"
import type { SOSAlert } from "../types/types"
import MapComponent from "../components/MapComponent"
import DeleteIcon from "@mui/icons-material/Delete"
import { getLocationName } from "../utils/geocoding"

interface ExtendedSOSAlert extends SOSAlert {
  locationName?: string
}

const SOSAlerts = () => {
  const [alerts, setAlerts] = useState<ExtendedSOSAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null)
  const [loadingLocations, setLoadingLocations] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const q = query(collection(db, "sos_alerts"), orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const loadingStates = snapshot.docs.reduce(
          (acc, doc) => {
            acc[doc.id] = true
            return acc
          },
          {} as { [key: string]: boolean },
        )
        setLoadingLocations(loadingStates)

        const alertsData = await Promise.all(
          snapshot.docs.map(async (alertDoc) => {
            const data = alertDoc.data();
            let contact = "Not provided";
            
            try {
              // Always try to fetch user data if userId exists
              if (data.userId) {
                const userDocRef = doc(db, "users", data.userId);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  // Prioritize contact from user registration
                  contact = userData.contact || userData.emergencyContact || "Not provided";
                }
              }
            } catch (error) {
              console.error("Error fetching user contact:", error);
            }

            return {
              id: alertDoc.id,
              location: {
                latitude: data.location?.latitude || 0,
                longitude: data.location?.longitude || 0,
              },
              locationName: data.locationName || "Fetching location...",
              contact,
              timestamp: data.timestamp?.toDate() || new Date(),
              status: data.status || "active",
              showButton: data.status !== "resolved",
            };
          })
        );
        
        setAlerts(alertsData);
      } catch (error) {
        console.error("Error processing alerts:", error);
      }
    });

    return () => unsubscribe();
  }, [])

  const handleResolve = async (alertId: string) => {
    try {
      const alertRef = doc(db, "sos_alerts", alertId)
      await updateDoc(alertRef, { status: "resolved" })

      // Remove the resolved alert from the state
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId))
    } catch (error) {
      console.error("Error updating alert:", error)
    }
  }

  const handleDelete = async (alertId: string) => {
    try {
      const alertRef = doc(db, "sos_alerts", alertId)
      await deleteDoc(alertRef)

      // Update the state to remove the deleted alert
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId))
    } catch (error) {
      console.error("Error deleting alert:", error)
    }
  }

  const handleMarkerClick = (alert: SOSAlert) => {
    setSelectedAlert(alert)
  }

  const handleViewOnGoogle = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        p: 3,
        borderRadius: "12px",
      }}
    >
      <Paper
        sx={{
          padding: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            color: "#1a237e",
            fontWeight: 600,
            mb: 4,
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          SOS Alerts
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)",
                }}
              >
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Contact</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Location</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Time</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  sx={{
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(26, 35, 126, 0.05)",
                      transform: "translateY(-2px)",
                    },
                    cursor: "pointer",
                  }}
                >
                  <TableCell>
                    <Chip
                      label={alert.status.toLowerCase() === "active" ? "active" : "resolved"}
                      sx={{
                        background:
                          alert.status === "active"
                            ? "linear-gradient(45deg, #ff1744 30%, #ff4081 90%)"
                            : "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "16px",
                        padding: "5px 10px",
                        fontSize: "14px",
                        textTransform: "lowercase",
                        boxShadow: alert.status === "active" ? "0 3px 5px 2px rgba(255, 23, 68, .3)" : "none",
                      }}
                    />
                  </TableCell>
                  <TableCell>{alert.contact}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewOnGoogle(alert.location.latitude, alert.location.longitude)}
                        sx={{
                          minWidth: "auto",
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          color: "#1a237e",
                          borderColor: "#1a237e",
                          "&:hover": {
                            backgroundColor: "rgba(26, 35, 126, 0.05)",
                            borderColor: "#0d47a1",
                          },
                        }}
                      >
                        View Map
                      </Button>

                      {/* Show live GPS coordinates */}
                      <Tooltip title="GPS Coordinates">
                        <Chip
                          size="small"
                          label={`${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}`}
                          sx={{
                            backgroundColor: "rgba(26, 35, 126, 0.1)",
                            fontSize: "0.75rem",
                            "& .MuiChip-label": {
                              padding: "0 6px",
                            },
                          }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>

                  <TableCell>{alert.timestamp.toLocaleString()}</TableCell>
                  <TableCell>
                    {alert.showButton ? (
                      <Button
                        variant="contained"
                        sx={{
                          background: "linear-gradient(45deg, #ff1744 30%, #ff4081 90%)",
                          color: "white",
                          fontWeight: "bold",
                          boxShadow: "0 3px 5px 2px rgba(255, 23, 68, .3)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "linear-gradient(45deg, #f50057 30%, #ff1744 90%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 10px 2px rgba(255, 23, 68, .3)",
                          },
                        }}
                        onClick={() => handleResolve(alert.id)}
                      >
                        MARK AS RESOLVED
                      </Button>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Button
                          variant="contained"
                          disabled
                          sx={{
                            backgroundColor: "#dee2e6", // Gray for Disabled "Resolved"
                            color: "black",
                            fontWeight: "bold",
                          }}
                        >
                          RESOLVED
                        </Button>
                        <Tooltip title="Delete SOS Alert">
                          <IconButton
                            onClick={() => handleDelete(alert.id)}
                            sx={{
                              background: "linear-gradient(45deg, #f44336 30%, #d32f2f 90%)",
                              color: "white",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)",
                                transform: "rotate(90deg)",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Map Component to display SOS alerts */}
        <Box sx={{ height: "400px", mt: 3, borderRadius: "8px", overflow: "hidden" }}>
          <MapComponent
            sosAlerts={alerts}
            reports={[]}
            onResolveAlert={handleResolve}
            selectedLocation={
              selectedAlert
                ? {
                    latitude: selectedAlert.location.latitude,
                    longitude: selectedAlert.location.longitude,
                    info: selectedAlert,
                  }
                : null
            }
            onViewOnGoogle={handleViewOnGoogle}
            onMarkerClick={handleMarkerClick}
          />
        </Box>
      </Paper>
    </Box>
  )
}

export default SOSAlerts

