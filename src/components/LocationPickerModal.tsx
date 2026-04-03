import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { toast } from "sonner";
import type { ResolvedLocation } from "@/hooks/useCurrentLocation";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LocationPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (location: ResolvedLocation) => void;
};

const reverseGeocode = async (lat: number, lng: number): Promise<ResolvedLocation> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`
  );
  if (!res.ok) throw new Error("Could not fetch address");
  const data = await res.json();
  const addr = data.address ?? {};
  const street = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood, addr.quarter]
    .filter(Boolean)
    .join(", ");
  return {
    address: data.display_name || street || "Selected location",
    city: addr.city || addr.town || addr.village || addr.county || "",
    state: addr.state || addr.state_district || "",
    pincode: addr.postcode || "",
    latitude: lat,
    longitude: lng,
  };
};

const searchPlace = async (query: string) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
  );
  if (!res.ok) return [];
  return res.json();
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

const LocationPickerModal = ({ open, onClose, onConfirm }: LocationPickerModalProps) => {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: 20.5937, lng: 78.9629 });
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const resolvePosition = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const loc = await reverseGeocode(lat, lng);
      setResolvedLocation(loc);
    } catch {
      setResolvedLocation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setPosition({ lat, lng });
      resolvePosition(lat, lng);
    },
    [resolvePosition]
  );

  const handleGPS = useCallback(() => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        resolvePosition(latitude, longitude);
        setGpsLoading(false);
      },
      () => {
        toast.error("Location permission denied");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [resolvePosition]);

  // Auto-detect on open
  useEffect(() => {
    if (open) handleGPS();
  }, [open]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (q.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      searchTimeout.current = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await searchPlace(q);
          setSearchResults(results);
        } catch {
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 400);
    },
    []
  );

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition({ lat, lng });
    resolvePosition(lat, lng);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-2xl gap-0 max-h-[90vh]">
        {/* Search bar */}
        <div className="p-3 border-b border-border bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border bg-background">
              {searchResults.map((r: any, i: number) => (
                <button
                  key={i}
                  onClick={() => selectSearchResult(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
                >
                  <span className="text-foreground line-clamp-1">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="relative h-[300px] w-full">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={14}
            className="h-full w-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[position.lat, position.lng]} icon={markerIcon} />
            <MapClickHandler onMapClick={handleMapClick} />
            <FlyToLocation lat={position.lat} lng={position.lng} />
          </MapContainer>

          {/* GPS button on map */}
          <button
            onClick={handleGPS}
            disabled={gpsLoading}
            className="absolute bottom-3 right-3 z-[1000] bg-card rounded-full p-2 shadow-lg border border-border hover:bg-accent transition-colors"
          >
            <LocateFixed className={`h-5 w-5 text-primary ${gpsLoading ? "animate-pulse" : ""}`} />
          </button>
        </div>

        {/* Address confirmation */}
        <div className="p-4 bg-card space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              {loading ? (
                <p className="text-sm text-muted-foreground animate-pulse">Fetching address...</p>
              ) : resolvedLocation ? (
                <>
                  <p className="font-semibold text-foreground text-sm line-clamp-1">
                    {resolvedLocation.city || resolvedLocation.state || "Selected Location"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {resolvedLocation.address}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Tap on the map to select a location</p>
              )}
            </div>
          </div>

          <Button
            variant="hero"
            className="w-full"
            disabled={!resolvedLocation || loading}
            onClick={() => {
              if (resolvedLocation) {
                onConfirm(resolvedLocation);
                onClose();
              }
            }}
          >
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerModal;
