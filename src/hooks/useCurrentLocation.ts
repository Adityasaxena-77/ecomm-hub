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

const ipFallbackLocation = async (): Promise<ResolvedLocation> => {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error("Could not detect location via IP");
  const d = await res.json();
  if (!d.latitude || !d.longitude) throw new Error("Could not detect location via IP");
  return {
    address: [d.city, d.region, d.country_name].filter(Boolean).join(", ") || "Approximate location",
    city: d.city || "",
    state: d.region || "",
    pincode: d.postal || "",
    latitude: d.latitude,
    longitude: d.longitude,
  };
};

export const useCurrentLocation = () => {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLoading(true);

    try {
      // Try browser GPS first
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 60000,
            });
          });
          try {
            return await reverseGeocode(position.coords.latitude, position.coords.longitude);
          } catch {
            return {
              address: "Current location selected",
              city: "",
              state: "",
              pincode: "",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
          }
        } catch (gpsErr) {
          // GPS denied/blocked (common in preview iframe) — fall back to IP
          try {
            return await ipFallbackLocation();
          } catch {
            const code = (gpsErr as GeolocationPositionError)?.code;
            if (code === 1) throw new Error("Location permission blocked. Allow location in browser settings, or open the app in a new tab.");
            if (code === 3) throw new Error("Location request timed out. Please try again.");
            throw new Error("Could not get your current location");
          }
        }
      }
      // No geolocation API — IP fallback
      return await ipFallbackLocation();
    } finally {
      setLoading(false);
    }
  };

  return { getCurrentLocation, loading };
};