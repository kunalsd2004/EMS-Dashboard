"use client"
import { useEffect, useState, useRef } from "react"
import { Typography, Button, Box, Paper, TextField, IconButton, Chip, CircularProgress } from "@mui/material"
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, getDoc, where } from "firebase/firestore"
import { db } from "../config/firebaseConfig"
import type { Report } from "../types/index"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import EditIcon from "@mui/icons-material/Edit"
import MapComponent from "../components/MapComponent"
import DeleteIcon from "@mui/icons-material/Delete" // Import the Delete icon
import { getLocationName } from "../utils/geocoding"


// Haversine formula to calculate distance between two points
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000 // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in meters
}

const fetchNearbyUsers = async (sosLocation: { latitude: number; longitude: number }) => {
  const usersQuery = query(collection(db, "users"))
  const snapshot = await getDocs(usersQuery)
  const nearbyUsers: any[] = []

  snapshot.forEach((doc) => {
    const userData = doc.data()
    const distance = haversineDistance(
      sosLocation.latitude,
      sosLocation.longitude,
      userData.location.latitude,
      userData.location.longitude,
    )
    if (distance <= 30) {
      nearbyUsers.push(userData)
    }
  })

  return nearbyUsers
}

const Reports = () => {
  const [description, setDescription] = useState<string>("")
  const [reports, setReports] = useState<Report[]>([])
  const [editingReportId, setEditingReportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [mapVisible, setMapVisible] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [redMarker, setRedMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [blueMarker, setBlueMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [filter, setFilter] = useState("all") // State for filter
  const [audioState, setAudioState] = useState<{ url: string | null; isPlaying: boolean }>({
    url: null,
    isPlaying: false,
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [loadingLocations, setLoadingLocations] = useState<{ [key: string]: boolean }>({})

  // Function to reset map-related state
  const resetMapState = () => {
    setCurrentLocation(null)
    setMapVisible(false)
    setRedMarker(null)
    setBlueMarker(null)
  }

  const handleUpdateDescription = async (reportId: string, description: string) => {
    try {
      const reportRef = doc(db, "reports", reportId)
      await updateDoc(reportRef, {
        description: description,
        lastUpdated: new Date(),
      })
      setEditingReportId(null)
      // Refresh reports
      fetchReports()
    } catch (error) {
      console.error("Error updating description:", error)
    }
  }

  const fetchReports = async () => {
    try {
      setLoading(true)
      const q = query(
        collection(db, "reports"),
        orderBy("timestamp", "desc") // Remove the dashboardVisible conditions
      );
      const querySnapshot = await getDocs(q)

      const reportsData: Report[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data()
          let locationName = "Fetching location..."

          try {
            locationName = await getLocationName(data.location?.latitude ?? 0, data.location?.longitude ?? 0)

            // Cache the location name in Firestore for future use
            if (locationName && locationName !== "Location not found") {
              await updateDoc(doc.ref, {
                locationName: locationName,
              })
            }
          } catch (error) {
            console.error(`Error fetching location for report ${doc.id}:`, error)
            locationName = data.locationName || "Location not available"
          }

          return {
            id: doc.id,
            contact: data.contact ?? "",
            image: data.image ?? undefined,
            imageUrl: data.imageUrl ?? undefined,
            location: {
              latitude: data.location?.latitude ?? 0,
              longitude: data.location?.longitude ?? 0,
            },
            severity: (data.severity ?? "low") as Report["severity"],
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
            userId: data.userId ?? "",
            status: (data.status ?? "pending") as Report["status"],
            type: data.type ?? "",
            title: data.title ?? "Untitled Report",
            audio: data.audio ?? undefined,
            description: data.description ?? "",
            locationName: locationName,
          }
        }),
      )

      setReports(reportsData)
      resetMapState()
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, "reports", reportId)

      // Get the report data before updating
      const reportDoc = await getDoc(reportRef)
      if (reportDoc.exists()) {
        // Instead of deleting, update the document with a dashboardVisible flag
        await updateDoc(reportRef, {
          dashboardVisible: false,
          dashboardDeletedAt: new Date(),
        })

        // Update local state to remove from dashboard view
        setReports((prevReports) => prevReports.filter((report) => report.id !== reportId))

        // Reset map state if needed
        if (selectedLocation && selectedLocation.info.id === reportId) {
          setSelectedLocation(null)
          setMapVisible(false)
          setCurrentLocation(null)
          resetMapState()
        }
      }
    } catch (error) {
      console.error("Error hiding report:", error)
    }
  }

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    marginBottom: "20px",
  }

  const center = {
    lat: 18.531577, // Default center latitude
    lng: 73.866348, // Default center longitude
  }

  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      orderBy("timestamp", "desc")
    );

    const fetchReports = async () => {
      try {
        setLoading(true)
        const querySnapshot = await getDocs(q);
      const reportsData: Report[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const locationName = await getLocationName(
            data.location?.latitude ?? 0,
            data.location?.longitude ?? 0
          );
            return {
              id: doc.id,
              contact: data.contact ?? "",
              image: data.image ?? undefined,
              imageUrl: data.imageUrl ?? undefined,
              location: {
                latitude: data.location?.latitude ?? 0,
                longitude: data.location?.longitude ?? 0,
              },
              severity: (data.severity ?? "low") as Report["severity"],
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
              userId: data.userId ?? "",
              status: (data.status ?? "pending") as Report["status"],
              type: data.type ?? "",
              title: data.title ?? "Untitled Report", // Ensure title has a default value
              audio: data.audio ?? undefined,
              description: data.description ?? "",
              locationName,
            }
          }),
        )
        setReports(reportsData)
        resetMapState()
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports() // Call function inside useEffect
  }, []) // Ensure it runs only once on component mount

  useEffect(() => {
    return () => {
      resetMapState()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // const updateStatus = async (reportId: string, newStatus: string, location: any) => {
  //   const reportRef = doc(db, 'reports', reportId);
  //   await updateDoc(reportRef, {
  //     status: newStatus,
  //     lastUpdated: new Date().toISOString()
  //   });
  //   setCurrentLocation(location);
  //   setMapVisible(true);
  //   setRedMarker(location);
  // };

  const updateStatus = async (
    reportId: string,
    newStatus: "pending" | "inProgress" | "ambulanceDispatched",
    location: any,
  ) => {
    const reportRef = doc(db, "reports", reportId)
    await updateDoc(reportRef, {
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    })

   // Update local state immediately
   setReports(prevReports =>
    prevReports.map(report =>
      report.id === reportId ? { ...report, status: newStatus } : report
    )
  )

    setCurrentLocation(location)
    setMapVisible(true)
    setRedMarker(location)
  }

  const handleRedMarkerClick = () => {
    setBlueMarker(redMarker)
  }

  const getStatusChip = (status: string) => {
    const styles = {
      padding: "6px 16px",
      borderRadius: "20px",
      color: "white",
      fontSize: "0.875rem",
      display: "inline-block",
    }

    switch (status) {
      case "pending":
        return <span style={{ ...styles, backgroundColor: "#F76707" }}>Pending</span>
      case "inProgress":
        return <span style={{ ...styles, backgroundColor: "#4F666A" }}>In Progress</span>
      case "ambulanceDispatched":
        return <span style={{ ...styles, backgroundColor: "#E0E0E0", color: "#000" }}>Ambulance Dispatched</span>
      default:
        return <span style={{ ...styles, backgroundColor: "#F76707" }}>Pending</span>
    }
  }

  const handleMarkerClick = (location: any, report: any) => {
    setSelectedLocation({
      position: {
        lat: Number.parseFloat(location.latitude),
        lng: Number.parseFloat(location.longitude),
      },
      info: {
        contact: report.contact,
        status: report.status,
        time: report.timestamp ? new Date(report.timestamp.seconds * 1000).toLocaleString() : "",
        imageUrl: report.imageUrl || "",
        severity: report.severity || "Not specified",
      },
    })
  }

  const getSeverityColor = (severity: string | undefined) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "#FF0000"
      case "medium":
        return "#FFA500"
      case "low":
        return "#FFFF00"
      default:
        return "#808080"
    }
  }

  const handleSOSButtonClick = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          await addDoc(collection(db, "sos_alerts"), {
            location: { latitude, longitude },
            timestamp: new Date(),
            status: "pending",
          })

          // Fetch nearby users
          const nearbyUsers = await fetchNearbyUsers({ latitude, longitude })
          console.log("Nearby users:", nearbyUsers)
          setOpenSnackbar(true)
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handlePlayPause = async (audioUrl: string) => {
    try {
      if (!audioUrl) {
        console.error("No audio URL provided")
        return
      }

      if (audioState.url === audioUrl && audioState.isPlaying) {
        // Pause current audio
        if (audioRef.current) {
          audioRef.current.pause()
          setAudioState({ url: null, isPlaying: false })
        }
      } else {
        // Stop previous audio if playing
        if (audioRef.current) {
          audioRef.current.pause()
        }

        // Create and play new audio
        const audio = new Audio(audioUrl)

        audio.onerror = (error) => {
          console.error("Audio loading error:", error)
          setAudioState({ url: null, isPlaying: false })
        }

        audio.addEventListener("ended", () => {
          setAudioState({ url: null, isPlaying: false })
        })

        await audio.play()
        audioRef.current = audio
        setAudioState({ url: audioUrl, isPlaying: true })
      }
    } catch (error) {
      console.error("Audio playback error:", error)
      setAudioState({ url: null, isPlaying: false })
    }
  }

  const filteredReports = reports.filter((report) => {
    if (filter === "sos") return report.type === "sos"
    if (filter === "accident") return report.type === "accident"
    return true // Show all
  })

  function handleResolve(alertId: string): void {
    throw new Error("Function not implemented.")
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #05445E 0%, #189AB4 50%, #75E6DA 100%)", // Ocean blue medical theme
        p: 3,
        borderRadius: "12px",
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{
            color: "#fff",
            fontWeight: 700,
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            mb: 2,
            background: "linear-gradient(45deg, #ffffff 30%, #E3F6F5 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Emergency Reports Dashboard
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {reports.map((report) => (
          <Paper
            key={report.id}
            elevation={3}
            sx={{
              p: 3,
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.25)",
              },
            }}
          >
            {/* Status Badge */}
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 2,
                display: "flex",
                gap: 1,
              }}
            >
              <Chip
                label={report.status}
                sx={{
                  background:
                    report.status === "pending"
                      ? "linear-gradient(45deg, #FF6B6B 30%, #FF8E8E 90%)"
                      : report.status === "inProgress"
                        ? "linear-gradient(45deg, #4ECDC4 30%, #45B7AF 90%)"
                        : "linear-gradient(45deg, #96CEB4 30%, #88BBA4 90%)",
                  color: "white",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
                }}
              />
            </Box>

            {/* Image Container with Gradient Overlay */}
            {(report.image || report.imageUrl) && (
              <Box
                sx={{
                  position: "relative",
                  mb: 3,
                  height: "200px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
                  },
                }}
              >
                <img
                  src={report.image || report.imageUrl}
                  alt="Incident"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}

            {/* Severity Indicator */}
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: "8px",
                background:
                  report.severity === "high"
                    ? "linear-gradient(45deg, #FF416C 30%, #FF4B2B 90%)"
                    : report.severity === "medium"
                      ? "linear-gradient(45deg, #F7971E 30%, #FFD200 90%)"
                      : "linear-gradient(45deg, #56CCF2 30%, #2F80ED 90%)",
                color: "white",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {report.severity.toUpperCase()} SEVERITY
              </Typography>
            </Box>

            {/* Description Editor */}
            <Box sx={{ mb: 3 }}>
              {editingReportId === report.id ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#189AB4",
                        },
                        "&:hover fieldset": {
                          borderColor: "#05445E",
                        },
                      },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingReportId(null)
                        setDescription("")
                      }}
                      sx={{
                        color: "#05445E",
                        "&:hover": {
                          backgroundColor: "rgba(5, 68, 94, 0.1)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleUpdateDescription(report.id, description)}
                      sx={{
                        background: "linear-gradient(45deg, #189AB4 30%, #75E6DA 90%)",
                        color: "white",
                        "&:hover": {
                          background: "linear-gradient(45deg, #05445E 30%, #189AB4 90%)",
                        },
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      backgroundColor: "rgba(24, 154, 180, 0.1)",
                      padding: 2,
                      borderRadius: 1,
                      color: "#05445E",
                    }}
                  >
                    {report.description || "No description provided"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
                    <IconButton
                      onClick={() => {
                        setEditingReportId(report.id)
                        setDescription(report.description)
                      }}
                      sx={{
                        color: "#189AB4",
                        "&:hover": {
                          backgroundColor: "rgba(24, 154, 180, 0.1)",
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => deleteReport(report.id)}
                      sx={{
                        color: "#FF416C",
                        "&:hover": {
                          backgroundColor: "rgba(255, 65, 108, 0.1)",
                          transform: "rotate(90deg)",
                          transition: "transform 0.3s ease",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Report Details */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: "#05445E",
                  borderBottom: "2px solid #189AB4",
                  paddingBottom: 1,
                }}
              >
                {report.title}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#05445E",
                      fontWeight: 600,
                      minWidth: "100px",
                    }}
                  >
                    Contact:
                  </Typography>
                  <Typography variant="body2">{report.contact}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#05445E",
                      fontWeight: 600,
                      minWidth: "100px",
                    }}
                  >
                    Location:
                  </Typography>
                  <Typography variant="body2">
                    {loadingLocations[report.id] ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={16} />
                        <span>Fetching location...</span>
                      </Box>
                    ) : (
                      <>
                        {report.locationName || "Location not available"}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${report.location.latitude},${report.location.longitude}`,
                              "_blank",
                            )
                          }
                          sx={{
                            ml: 1,
                            minWidth: "auto",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            color: "#189AB4",
                            borderColor: "#189AB4",
                            "&:hover": {
                              borderColor: "#05445E",
                              backgroundColor: "rgba(24, 154, 180, 0.1)",
                            },
                          }}
                        >
                          View Map
                        </Button>
                      </>
                    )}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#05445E",
                      fontWeight: 600,
                      minWidth: "100px",
                    }}
                  >
                    Time:
                  </Typography>
                  <Typography variant="body2">{report.timestamp.toLocaleString()}</Typography>
                </Box>

                {report.description && (
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#05445E",
                        fontWeight: 600,
                        minWidth: "100px",
                      }}
                    >
                      Description:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        flex: 1,
                        backgroundColor: "rgba(24, 154, 180, 0.1)",
                        padding: 1,
                        borderRadius: 1,
                      }}
                    >
                      {report.description}
                    </Typography>
                  </Box>
                )}

                {report.audio && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#05445E",
                        fontWeight: 600,
                        minWidth: "100px",
                      }}
                    >
                      Audio:
                    </Typography>
                    <IconButton
                      onClick={() => handlePlayPause(report.audio as string)}
                      sx={{
                        color: "#189AB4",
                        "&:hover": {
                          backgroundColor: "rgba(24, 154, 180, 0.1)",
                        },
                      }}
                    >
                      {audioState.url === report.audio && audioState.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              {report.status === "pending" && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => updateStatus(report.id, "inProgress", report.location)}
                  sx={{
                    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    color: "white",
                    fontWeight: "bold",
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(45deg, #1976D2 30%, #1BB9E3 90%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 12px rgba(33, 203, 243, 0.3)",
                    },
                  }}
                >
                  Start Response
                </Button>
              )}

              {report.status === "inProgress" && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => updateStatus(report.id, "ambulanceDispatched", report.location)}
                  sx={{
                    background: "linear-gradient(45deg, #FF4B2B 30%, #FF416C 90%)",
                    color: "white",
                    fontWeight: "bold",
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(45deg, #E64428 30%, #E63B61 90%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 12px rgba(255, 75, 43, 0.3)",
                    },
                  }}
                >
                  Dispatch Ambulance
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Map Component with Enhanced Styling */}
      <Box
        sx={{
          mt: 4,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        }}
      >
        <MapComponent
          reports={reports}
          sosAlerts={[]}
          onResolveAlert={handleResolve}
          selectedLocation={selectedLocation}
          onViewOnGoogle={(lat, lng) => window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")}
          onMarkerClick={(alert) => handleMarkerClick(alert.location, alert)}
        />
      </Box>
    </Box>
  )
}

export default Reports;