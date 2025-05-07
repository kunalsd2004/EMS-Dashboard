export const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    console.log(`Fetching location for: lat=${latitude}, lon=${longitude}`);

    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`,
      { headers: { 'Accept': 'application/json', 'Accept-Language': 'en' } }
    );

    console.log("OSM API Response Status:", osmResponse.status);

    if (!osmResponse.ok) throw new Error(`OpenStreetMap API error: ${osmResponse.status}`);

    const osmData = await osmResponse.json();
    console.log("OSM Data:", osmData);

    if (osmData.address) {
      const address = osmData.address;
      const components = [
        address.road || address.pedestrian || address.street,
        address.suburb || address.neighbourhood || address.residential,
        address.city || address.town || address.village,
        address.state || address.state_district,
      ].filter(Boolean); // Remove empty values

      if (components.length > 0) {
        console.log("Final OSM Address:", components.slice(0, 3).join(", "));
        return components.slice(0, 3).join(", ");
      }
    }

    if (osmData.display_name) {
      console.log("Fallback OSM Display Name:", osmData.display_name);
      return osmData.display_name.split(",").slice(0, 3).join(",").trim();
    }

    // If OSM fails, try Google Maps API (if key is provided)
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.log("Trying Google Maps API...");

      const googleResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      console.log("Google API Response Status:", googleResponse.status);

      if (!googleResponse.ok) throw new Error(`Google Maps API error: ${googleResponse.status}`);

      const googleData = await googleResponse.json();
      console.log("Google Maps Data:", googleData);

      if (googleData.status === "OK" && googleData.results?.[0]?.formatted_address) {
        const result = googleData.results[0].formatted_address;
        console.log("Final Google Address:", result);
        return result.split(",").slice(0, 3).join(",").trim();
      }
    }

    console.error("Location not found from any source.");
    return "Location details unavailable";
  } catch (error) {
    console.error("Error in getLocationName:", error);
    return "Error fetching location";
  }
};
