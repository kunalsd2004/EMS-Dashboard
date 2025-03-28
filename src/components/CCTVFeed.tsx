import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ImageList,
  ImageListItem,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import WarningIcon from '@mui/icons-material/Warning';

interface AccidentFrame {
  id: string;
  frame_url: string;
  timestamp: any;
  confidence_score: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const CCTVFeed: React.FC = () => {
  const [accidentFrames, setAccidentFrames] = useState<AccidentFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<AccidentFrame | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // Query the latest accident frames
    const q = query(
      collection(db, 'accident_frames'),
      orderBy('timestamp', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const frames: AccidentFrame[] = [];
      snapshot.forEach((doc) => {
        frames.push({
          id: doc.id,
          frame_url: doc.data().frame_url,
          timestamp: doc.data().timestamp?.toDate(),
          confidence_score: doc.data().confidence_score || 0,
          location: doc.data().location,
        });
      });
      setAccidentFrames(frames);

      // Play alert sound for new accidents
      if (frames.length > 0 && frames[0].timestamp > new Date(Date.now() - 5000)) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (frame: AccidentFrame) => {
    setSelectedFrame(frame);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFrame(null);
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 3,
        background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(240,240,240,0.9))',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <WarningIcon sx={{ color: '#d32f2f', mr: 1 }} />
        <Typography
          variant="h6"
          sx={{
            color: '#1a2a6c',
            fontWeight: 600,
            borderBottom: '2px solid rgba(26,42,108,0.1)',
            pb: 1,
            flexGrow: 1,
          }}
        >
          Live Accident Detection Feed
        </Typography>
        <Chip
          label={`${accidentFrames.length} Recent Detections`}
          color="error"
          size="small"
        />
      </Box>

      <ImageList sx={{ width: '100%', height: 450 }} cols={2} rowHeight={200}>
        {accidentFrames.map((frame) => (
          <ImageListItem
            key={frame.id}
            sx={{
              overflow: 'hidden',
              borderRadius: '10px',
              m: 1,
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.02)',
                transition: 'transform 0.3s ease',
              },
            }}
          >
            <img
              src={frame.frame_url}
              alt={`Accident detected at ${frame.timestamp?.toLocaleString()}`}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px',
              }}
            >
              <Typography variant="caption" sx={{ display: 'block' }}>
                {frame.timestamp?.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: '#ff9800' }}>
                Confidence: {(100 - frame.confidence_score * 100).toFixed(1)}%
              </Typography>
            </Box>
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
              }}
              onClick={() => handleOpenDialog(frame)}
            >
              <ZoomInIcon />
            </IconButton>
          </ImageListItem>
        ))}
      </ImageList>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedFrame && (
            <>
              <img
                src={selectedFrame.frame_url}
                alt={`Accident detected at ${selectedFrame.timestamp?.toLocaleString()}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '16px',
                }}
              >
                <Typography variant="body1">
                  Detected: {selectedFrame.timestamp?.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                  Confidence Score: {(100 - selectedFrame.confidence_score * 100).toFixed(1)}%
                </Typography>
                {selectedFrame.location && (
                  <Typography variant="body2">
                    Location: {selectedFrame.location.latitude}, {selectedFrame.location.longitude}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default CCTVFeed; 