import { Timestamp } from 'firebase/firestore';

export const formatTimestamp = (timestamp: Timestamp | any) => {
  if (!timestamp) return 'N/A';
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleString();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};