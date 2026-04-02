import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrentLocation, type ResolvedLocation } from "@/hooks/useCurrentLocation";

type CurrentLocationButtonProps = {
  onLocationResolved: (location: ResolvedLocation) => void;
  className?: string;
};

const CurrentLocationButton = ({ onLocationResolved, className }: CurrentLocationButtonProps) => {
  const { getCurrentLocation, loading } = useCurrentLocation();

  const handleClick = async () => {
    try {
      const location = await getCurrentLocation();
      onLocationResolved(location);
      toast.success("Current location added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not get current location");
    }
  };

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={loading} className={cn("shrink-0", className)}>
      <LocateFixed className="h-4 w-4" />
      {loading ? "Getting location..." : "Use Current Location"}
    </Button>
  );
};

export default CurrentLocationButton;