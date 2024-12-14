import { SpeedSettings } from "./types";

interface SpeedControlsProps {
  speedSettings: SpeedSettings;
  onSpeedChange: (newSettings: SpeedSettings) => void;
}

const SpeedControls: React.FC<SpeedControlsProps> = ({
  speedSettings,
  onSpeedChange,
}) => {
  const handleSpeedChange = (newSpeed: number) => {
    onSpeedChange({
      ...speedSettings,
      speed: newSpeed,
    });
  };

  const handleUnitToggle = () => {
    const newUnit = speedSettings.unit === "mph" ? "kph" : "mph";
    const newSpeed =
      speedSettings.unit === "mph"
        ? Math.round(speedSettings.speed * 1.60934) // Convert to KPH
        : Math.round(speedSettings.speed / 1.60934); // Convert to MPH

    onSpeedChange({
      speed: newSpeed,
      unit: newUnit,
    });
  };

  return (
    <div className="p-4 flex items-center justify-between bg-gray-50">
      <div className="flex items-center space-x-4 flex-1">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Average Speed:
        </span>
        <input
          type="range"
          min={speedSettings.unit === "mph" ? 10 : 16}
          max={speedSettings.unit === "mph" ? 25 : 40}
          value={speedSettings.speed}
          step="1"
          onChange={(e) => handleSpeedChange(Number(e.target.value))}
          className="flex-1 max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-900 min-w-[80px]">
          {speedSettings.speed} {speedSettings.unit}
        </span>
      </div>
      <button
        onClick={handleUnitToggle}
        className="ml-4 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-600 rounded hover:bg-indigo-50"
      >
        Switch to {speedSettings.unit === "mph" ? "km/h" : "mph"}
      </button>
    </div>
  );
};

export default SpeedControls;
