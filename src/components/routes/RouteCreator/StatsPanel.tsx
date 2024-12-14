import { RouteDetails, SpeedSettings } from "./types";

interface RouteMetadata {
  scenicScore: number;
  trafficScore: number;
  difficultyScore: number;
  pointsOfInterest: string[];
  weatherConsiderations?: string[];
  safetyNotes?: string[];
}

interface StatsPanelProps {
  routePoints: number;
  routeDetails: RouteDetails | null;
  speedSettings: SpeedSettings;
  calculateTime: (
    distance: number,
    speed: number,
    unit: "mph" | "kph"
  ) => {
    hours: number;
    minutes: number;
  };
  metadata?: RouteMetadata | null; // Added metadata prop as optional
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  routePoints,
  routeDetails,
  speedSettings,
  calculateTime,
  metadata,
}) => {
  const getTimeDisplay = () => {
    if (!routeDetails) return "0m";

    const estimate = calculateTime(
      routeDetails.distance,
      speedSettings.speed,
      speedSettings.unit
    );

    return estimate.hours > 0
      ? `${estimate.hours}h ${estimate.minutes}m`
      : `${estimate.minutes}m`;
  };

  return (
    <div className="p-4 border-b">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Points: {routePoints}</span>
        <span>
          Distance:{" "}
          {routeDetails
            ? `${(routeDetails.distance / 1000).toFixed(1)} km`
            : "0.0 km"}
        </span>
        <span>
          Time @ {speedSettings.speed} {speedSettings.unit}: {getTimeDisplay()}
        </span>
        {metadata && <span>Scenic Rating: {metadata.scenicScore}/10</span>}
      </div>
    </div>
  );
};

export default StatsPanel;
