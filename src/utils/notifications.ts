import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { calculateDistance, Coordinates } from './distance';
import { credential } from 'firebase-admin';
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import { playNotificationSound } from '../utils/sound'; // Adjust path accordingly


export const addNotification = (data: { type: string; }) => {
  if (data.type === "SOS") {
    playNotificationSound("sos"); // Play SOS alert sound
  } else if (data.type === "Report") {
    playNotificationSound("report"); // Play report alert sound
  }
};


// Types
export interface User {
  id: string;
  fcmToken?: string;
  location?: Coordinates;
}

// Firebase Admin initialization
const initializeFirebaseAdmin = () => {
  try {
    const serviceAccount = require(path.join(process.cwd(), 'service-account-key.json'));
    return initializeAdminApp({
      credential: credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }, 'ems-admin-app');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw new Error('Firebase Admin SDK initialization failed. Please check your service account key.');
  }
};

// Initialize the admin app
const adminApp = initializeFirebaseAdmin();

export const sendPushNotification = async (
  userToken: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<boolean> => {
  try {
    const message = {
      token: userToken,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
      },
    };

    const response = await getMessaging().send(message);
    console.log('Successfully sent message:', response);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

export const notifyNearbyUsers = async (
  accidentLocation: Coordinates,
  locationName: string,
  maxDistance: number = 2
): Promise<number> => {
  try {
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const nearbyUsers: User[] = [];

    // Filter users within the specified radius
    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      if (userData.location && userData.fcmToken) {
        const distance = calculateDistance(accidentLocation, userData.location);
        if (distance <= maxDistance) {
          nearbyUsers.push({ ...userData, id: doc.id });
        }
      }
    });

    // Send notifications to nearby users
    const notificationPromises = nearbyUsers.map((user) => {
      if (!user.fcmToken) return Promise.resolve();

      const distance = calculateDistance(accidentLocation, user.location!).toFixed(2);
      const notificationTitle = '🚨 EMS Emergency Alert';
      const notificationBody = `An accident has been reported ${distance}km away near ${locationName}. Tap for details.`;
      
      return sendPushNotification(
        user.fcmToken,
        notificationTitle,
        notificationBody,
        {
          type: 'ACCIDENT_ALERT',
          location: JSON.stringify(accidentLocation),
          locationName,
          distance
        }
      );
    });

    await Promise.all(notificationPromises);
    console.log(`Notifications sent to ${nearbyUsers.length} nearby users`);
    return nearbyUsers.length;
  } catch (error) {
    console.error('Error notifying nearby users:', error);
    return 0;
  }
};
