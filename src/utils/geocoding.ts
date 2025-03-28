export const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Try OpenStreetMap with proper headers and error handling
    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en'
        }
      }
    )
    
    if (!osmResponse.ok) {
      throw new Error(`OpenStreetMap API error: ${osmResponse.status}`)
    }

    const osmData = await osmResponse.json()
    
    if (osmData.error) {
      throw new Error(osmData.error)
    }

    if (osmData.address) {
      const components = []
      const address = osmData.address

      // Build address from most specific to least specific
      if (address.road || address.pedestrian || address.street) 
        components.push(address.road || address.pedestrian || address.street)
      if (address.suburb || address.neighbourhood || address.residential)
        components.push(address.suburb || address.neighbourhood || address.residential)
      if (address.city || address.town || address.village)
        components.push(address.city || address.town || address.village)
      if (address.state || address.state_district)
        components.push(address.state || address.state_district)

      if (components.length > 0) {
        return components.slice(0, 3).join(", ")
      }
    }

    // Fallback to display_name if address components aren't available
    if (osmData.display_name) {
      const parts = osmData.display_name.split(",")
      return parts.slice(0, 3).join(",").trim()
    }

    // Try Google Maps if OpenStreetMap doesn't return useful results
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      try {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        )

        if (!googleResponse.ok) {
          throw new Error(`Google Maps API error: ${googleResponse.status}`)
        }

        const googleData = await googleResponse.json()

        if (googleData.status === "OK" && googleData.results && googleData.results[0]) {
          const result = googleData.results[0]
          if (result.formatted_address) {
            return result.formatted_address.split(",").slice(0, 3).join(",").trim()
          }
        }
      } catch (error) {
        console.error("Google Maps geocoding error:", error)
        // Continue to final error handling
      }
    }

    return "Location details unavailable"
  } catch (error) {
    console.error("Error in getLocationName:", error)
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network")) {
        return "Network error while fetching location"
      }
      if (error.message.includes("API error")) {
        return "Service temporarily unavailable"
      }
    }
    return "Error fetching location"
  }
}

