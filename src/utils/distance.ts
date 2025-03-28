export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers

  const lat1 = point1.latitude * Math.PI / 180;
  const lat2 = point2.latitude * Math.PI / 180;
  const lon1 = point1.longitude * Math.PI / 180;
  const lon2 = point2.longitude * Math.PI / 180;

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers

  return distance;
}

export const findNearbyUsers = async (
  accidentLocation: Coordinates,
  maxDistance: number = 2 // Default 2km radius
) => {
  try {
    const nearbyUsers: any[] = [];
    // We'll implement this function to query users from Firestore
    return nearbyUsers;
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return [];
  }
} 