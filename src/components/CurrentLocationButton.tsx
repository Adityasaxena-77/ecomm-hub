import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResolvedLocation } from "@/hooks/useCurrentLocation";
import LocationPickerModal from "@/components/LocationPickerModal";

type CurrentLocationButtonProps = {
  onLocationResolved: (location: ResolvedLocation) => void;
  className?: string;
};

const CurrentLocationButton = ({ onLocationResolved, className }: CurrentLocationButtonProps) => {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setMapOpen(true)}
        className={cn("shrink-0", className)}
      >
        <MapPin className="h-4 w-4" />
        Use Current Location
      </Button>

      <LocationPickerModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={(location) => {
          onLocationResolved(location);
          toast.success("Location selected successfully!");
        }}
      />
    </>
  );
};

export default CurrentLocationButton;
