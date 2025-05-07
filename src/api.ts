// EMS-APP2/src/api.ts
import axios from 'axios';
import { Hospital } from './types/types'; // Import the Hospital type

const GOOGLE_MAPS_API_KEY = 'AIzaSyAEXbupQ1l7Py7viWOtaVUsJgk0L_Eurz0'; // Your API key

export const fetchNearbyHospitals = async (latitude: number, longitude: number): Promise<Hospital[]> => {
  const radius = 5000; // 5 km radius
  const type = 'hospital'; // Type of place to search for
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    return response.data.results.map((hospital: any) => ({
      id: hospital.place_id,
      name: hospital.name,
      location: {
        latitude: hospital.geometry.location.lat,
        longitude: hospital.geometry.location.lng,
      },
    })) as Hospital[]; // Cast to Hospital[]
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    return []; // Return an empty array in case of an error
  }
};