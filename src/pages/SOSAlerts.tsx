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
  CircularProgress,
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
        // Set loading state for each alert
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
            const data = alertDoc.data()
            let contact = "Not provided"
            let locationName = "Fetching location..."

            try {
              if (data.userId) {
                const userDocRef = doc(db, "users", data.userId)
                const userDoc = await getDoc(userDocRef)
                if (userDoc.exists()) {
                  const userData = userDoc.data() as { contact?: string }
                  contact = userData.contact || "Not provided"
                }
              }

              // Get location name using your existing function
              locationName = await getLocationName(data.location?.latitude || 0, data.location?.longitude || 0)

              // If this is a new alert (within last minute) and has valid location, notify nearby users
              const timestamp = data.timestamp?.toDate() || new Date()
              const isNewAlert = (new Date().getTime() - timestamp.getTime()) < 60000 // Within last minute
              
              if (isNewAlert && data.location && locationName && !locationName.includes("error") && !locationName.includes("unavailable")) {
                const notifiedCount = await notifyNearbyUsers(
                  {
                    latitude: data.location.latitude,
                    longitude: data.location.longitude
                  },
                  locationName
                )
                console.log(`Notified ${notifiedCount} nearby users about accident at ${locationName}`)
              }

              // If location is still not found after using your getLocationName function
              if (locationName === "Location not found" || locationName === "Location not available") {
                try {
                  // Try a more detailed OpenStreetMap query as a last resort
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${data.location?.latitude || 0}&lon=${data.location?.longitude || 0}&format=json&zoom=18&addressdetails=1`,
                  )

                  if (response.ok) {
                    const osmData = await response.json()

                    if (osmData.display_name) {
                      // Format the display name to be more concise
                      locationName = osmData.display_name.split(",").slice(0, 3).join(",")
                    } else if (osmData.address) {
                      // Build a more user-friendly location string from address components
                      const address = osmData.address
                      const components = []

                      // Add the most important address components in a logical order
                      if (address.road) components.push(address.road)
                      if (address.suburb || address.neighbourhood)
                        components.push(address.suburb || address.neighbourhood)
                      if (address.city || address.town || address.village) {
                        components.push(address.city || address.town || address.village)
                      }
                      if (address.state || address.county) components.push(address.state || address.county)
                      if (address.country) components.push(address.country)

                      locationName = components.length > 0 ? components.join(", ") : "Location details unavailable"
                    }
                  }

                  // If still no location found, show unavailable message
                  if (locationName === "Location not found" || locationName === "Location not available") {
                    locationName = "Location details unavailable"
                  }
                } catch (error) {
                  console.error("Error in location fallback:", error)
                  locationName = "Location details unavailable"
                }
              }
            } catch (error) {
              console.error("Error fetching location details:", error)
              locationName = "Error fetching location"
            } finally {
              // Update loading state
              setLoadingLocations((prev) => ({
                ...prev,
                [alertDoc.id]: false,
              }))
            }

            return {
              id: alertDoc.id,
              location: {
                latitude: data.location?.latitude || 0,
                longitude: data.location?.longitude || 0,
              },
              locationName,
              contact,
              timestamp: data.timestamp?.toDate() || new Date(),
              status: data.status || "active",
              showButton: data.status !== "resolved",
            }
          }),
        )

        setAlerts(alertsData)
      } catch (error) {
        console.error("Error processing alerts:", error)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleResolve = async (alertId: string) => {
    try {
      const alertRef = doc(db, "sos_alerts", alertId)
      await updateDoc(alertRef, { status: "resolved" })

      // Remove the resolved alert from the state
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.id !== alertId)
      )
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
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {loadingLocations[alert.id] ? (
                          <CircularProgress size={16} thickness={4} sx={{ color: "#1a237e" }} />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              color: alert.locationName?.includes("error") || alert.locationName?.includes("unavailable") 
                                ? "#d32f2f" 
                                : "#1a237e",
                              fontWeight: "500",
                              maxWidth: "400px",
                              lineHeight: "1.4",
                            }}
                          >
                            {alert.locationName || "Fetching location..."}
                          </Typography>
                        )}
                      </Box>
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

function notifyNearbyUsers(arg0: { latitude: any; longitude: any }, locationName: string) {
  throw new Error("Function not implemented.")
}

