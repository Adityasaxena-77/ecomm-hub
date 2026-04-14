import { useState } from "react";

export type ResolvedLocation = {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
};

const reverseGeocode = async (latitude: number, longitude: number): Promise<ResolvedLocation> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${latitude}&lon=${longitude}`,
  );

  if (!response.ok) {
    throw new Error("Could not fetch address from your current location");
  }

  const data = await response.json();
  const address = data.address ?? {};

  const streetAddress = [
    address.house_number,
    address.road,
    address.suburb,
    address.neighbourhood,
    address.quarter,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    address: data.display_name || streetAddress || "Current location selected",
    city: address.city || address.town || address.village || address.county || "",
    state: address.state || address.state_district || "",
    pincode: address.postcode || "",
    latitude,
    longitude,
  };
};

export const useCurrentLocation = () => {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    if (!("geolocation" in navigator)) {
      throw new Error("Geolocation is not supported on this device");
    }

    setLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      return await reverseGeocode(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === error.PERMISSION_DENIED) {
          throw new Error("Location permission denied. Please allow location access.");
        }

        if (error.code === error.TIMEOUT) {
          throw new Error("Location request timed out. Please try again.");
        }
      }

      throw error instanceof Error ? error : new Error("Could not get your current location");
    } finally {
      setLoading(false);
    }
  };

  return { getCurrentLocation, loading };
};