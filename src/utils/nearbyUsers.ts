import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { calculateDistance } from './distance';
import { sendPushNotification } from './notifications';

interface Location {
  latitude: number;
  longitude: number;
}

export const checkAndNotifyNearbyUsers = async (
  currentUserId: string,
  currentUserLocation: Location,
  currentUserEmail: string,
  maxDistance: number = 2 // Default 2km radius
) => {
  try {
    // Get all users from Firestore
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const nearbyUsers: Array<{ id: string; distance: number; fcmToken: string }> = [];

    // Filter users within the specified radius
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      
      // Skip if it's the current user or if user has no location/fcmToken
      if (
        doc.id === currentUserId ||
        !userData.location ||
        !userData.fcmToken ||
        !userData.email
      ) {
        return;
      }

      const distance = calculateDistance(
        currentUserLocation,
        userData.location
      );

      // If user is within maxDistance kilometers
      if (distance <= maxDistance) {
        nearbyUsers.push({
          id: doc.id,
          distance,
          fcmToken: userData.fcmToken
        });
      }
    });

    // Send notifications to nearby users
    const notificationPromises = nearbyUsers.map((user) => {
      const notificationTitle = '👋 Nearby User Alert';
      const notificationBody = `A user (${currentUserEmail}) is ${user.distance.toFixed(2)}km away from your location`;
      
      return sendPushNotification(
        user.fcmToken,
        notificationTitle,
        notificationBody,
        {
          type: 'NEARBY_USER',
          distance: user.distance.toFixed(2),
          userEmail: currentUserEmail
        }
      );
    });

    await Promise.all(notificationPromises);
    console.log(`Notifications sent to ${nearbyUsers.length} nearby users`);
    return nearbyUsers.length;
  } catch (error) {
    console.error('Error checking nearby users:', error);
    return 0;
  }
}; 