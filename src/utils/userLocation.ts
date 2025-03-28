import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

interface UserLocation {
  latitude: number;
  longitude: number;
  lastUpdated: number;
  fcmToken: string;
  email: string;
}

export const updateUserLocation = async (
  userId: string,
  location: { latitude: number; longitude: number },
  fcmToken: string,
  email: string
) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, {
      location,
      fcmToken,
      email,
      lastUpdated: Date.now()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error updating user location:', error);
    return false;
  }
};

export const getUserLocation = async (userId: string): Promise<UserLocation | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserLocation;
    }
    return null;
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
}; 