import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import type { SOSAlert, Report } from '../types/types';

interface MapComponentProps {
  sosAlerts: SOSAlert[];
  reports: Report[];
  selectedLocation: { latitude: number; longitude: number; info: any; } | null;
  onViewOnGoogle: (latitude: number, longitude: number) => void;
  onMarkerClick: (alert: SOSAlert) => void;
  onResolveAlert: (alertId: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ sosAlerts, reports, selectedLocation, onViewOnGoogle, onMarkerClick, onResolveAlert }) => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    marginTop: '20px',
    borderRadius: '8px',
  };

  const center = {
    lat: sosAlerts.length > 0 ? sosAlerts[0].location.latitude : (reports.length > 0 ? reports[0].location.latitude : 20.5937),
    lng: sosAlerts.length > 0 ? sosAlerts[0].location.longitude : (reports.length > 0 ? reports[0].location.longitude : 78.9629),
  };

  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (selectedReport && !reports.some(report => report.id === selectedReport.id)) {
      setSelectedReport(null);
    }
  }, [reports]);

  const formatTimestamp = (timestamp: any) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString(); // Format as needed
    }
    return '';
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
      >
        {sosAlerts.map((alert) => (
          <Marker
            key={alert.id}
            position={{ lat: alert.location.latitude, lng: alert.location.longitude }}
            label={alert.status === 'active' ? 'SOS' : 'Resolved'}
            onClick={() => {
              setSelectedAlert(alert);
              onMarkerClick(alert);
            }}
            icon={{
              url: alert.status === 'active' ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(30, 30),
            }}
          />
        ))}

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={{ lat: report.location.latitude, lng: report.location.longitude }}
            label={report.severity}
            onClick={() => setSelectedReport(report)}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
          />
        ))}

        {selectedAlert && (
          <InfoWindow
            position={{
              lat: selectedAlert.location.latitude,
              lng: selectedAlert.location.longitude,
            }}
            onCloseClick={() => setSelectedAlert(null)}
          >
            <div style={{ padding: '10px', maxWidth: '300px' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{selectedAlert.contact}</h4>
              <p style={{ margin: '4px 0' }}>
                <strong>Status:</strong> {selectedAlert.status}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Location:</strong> {selectedAlert.location.latitude}, {selectedAlert.location.longitude}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Time:</strong> {formatTimestamp(selectedAlert.timestamp)}
              </p>
              <p style={{ margin: '8px 0 0 0' }}>
                <strong>View on Google Maps: </strong>
                <a 
                  href={`https://www.google.com/maps?q=${selectedAlert.location.latitude},${selectedAlert.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#1a73e8',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                  onClick={() => onViewOnGoogle(selectedAlert.location.latitude, selectedAlert.location.longitude)}
                >
                  Click Here
                </a>
              </p>
              <button onClick={() => onResolveAlert(selectedAlert.id)}>Mark as Resolved</button>
            </div>
          </InfoWindow>
        )}

        {selectedReport && (
          <InfoWindow
            position={{
              lat: selectedReport.location.latitude,
              lng: selectedReport.location.longitude,
            }}
            onCloseClick={() => setSelectedReport(null)}
          >
            <div>
              <h4>{selectedReport.contact}</h4>
              <p>Severity: {selectedReport.severity}</p>
              <p>Location: {selectedReport.location.latitude}, {selectedReport.location.longitude}</p>
              <p>Timestamp: {formatTimestamp(selectedReport.timestamp)}</p>
              <p>View on Google Maps: <a href={`https://www.google.com/maps?q=${selectedReport.location.latitude},${selectedReport.location.longitude}`} target="_blank" rel="noopener noreferrer">Click Here</a></p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;