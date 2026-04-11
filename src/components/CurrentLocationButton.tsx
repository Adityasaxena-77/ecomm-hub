import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import type { ResolvedLocation } from "@/hooks/useCurrentLocation";

type CurrentLocationButtonProps = {
  onLocationResolved: (location: ResolvedLocation) => void;
  className?: string;
};

const CurrentLocationButton = ({ onLocationResolved, className }: CurrentLocationButtonProps) => {
  const { getCurrentLocation, loading } = useCurrentLocation();

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      onLocationResolved(location);
      toast.success("Current location selected successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not get your current location");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handleUseCurrentLocation()}
      disabled={loading}
      className={cn("shrink-0", className)}
    >
      <LocateFixed className={cn("h-4 w-4", loading && "animate-pulse")} />
      {loading ? "Detecting Location..." : "Use Current Location"}
    </Button>
  );
};

export default CurrentLocationButton;
