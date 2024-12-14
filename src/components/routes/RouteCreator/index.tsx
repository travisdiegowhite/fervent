import { useState, useCallback, useEffect } from "react";
import Header from "./Header";
import Map from "./Map";
import StatsPanel from "./StatsPanel";
import SpeedControls from "./SpeedControls";
import SaveRouteModal from "./SaveRouteModal";
import { supabase } from "../../../Config/supabase";
import {
  RoutePoint,
  RouteDetails,
  SearchResult,
  SpeedSettings,
  SaveRouteData,
  RouteInsert,
} from "./types";

interface SaveStatus {
  loading: boolean;
  error: string | null;
}

const RouteCreator = () => {
  const [routeType, setRouteType] = useState<"cycling" | "walking">("cycling");
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [speedSettings, setSpeedSettings] = useState<SpeedSettings>({
    speed: 15,
    unit: "mph",
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    loading: false,
    error: null,
  });
  const [userLocation, setUserLocation] = useState<
    [number, number] | undefined
  >(undefined);

  const handleRouteTypeChange = useCallback(
    (newType: "cycling" | "walking") => {
      setRouteType(newType);
    },
    []
  );

  const handleSearch = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
        );
        const data = await response.json();
        return data.features.map((feature: any) => ({
          text: feature.place_name,
          center: feature.center,
        }));
      } catch (error) {
        console.error("Geocoding error:", error);
        return [];
      }
    },
    []
  );

  const handleLocationSelect = useCallback((result: SearchResult) => {
    const newPoint: RoutePoint = {
      id: Math.random().toString(36).substr(2, 9),
      coordinates: result.center,
    };
    setRoutePoints((currentPoints) => [...currentPoints, newPoint]);
  }, []);

  const handleRoutePointsChange = useCallback(
    (newPoints: RoutePoint[]) => {
      if (newPoints.length === routePoints.length + 1) {
        const addedPoint = newPoints[newPoints.length - 1];
        setRoutePoints((currentPoints) => [...currentPoints, addedPoint]);
      } else if (newPoints.length <= routePoints.length) {
        setRoutePoints(newPoints);
      }
    },
    [routePoints]
  );

  const handleClearRoute = useCallback(() => {
    setRoutePoints([]);
    setRouteDetails(null);
  }, []);

  const calculateTime = useCallback(
    (
      distance: number,
      speed: number,
      unit: "mph" | "kph"
    ): { hours: number; minutes: number } => {
      const distanceInUnits =
        unit === "mph" ? distance / 1609.34 : distance / 1000;
      const totalHours = distanceInUnits / speed;
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      return { hours, minutes };
    },
    []
  );

  const getTimeEstimate = useCallback(() => {
    if (!routeDetails) return "0m";
    const estimate = calculateTime(
      routeDetails.distance,
      speedSettings.speed,
      speedSettings.unit
    );
    return estimate.hours > 0
      ? `${estimate.hours}h ${estimate.minutes}m`
      : `${estimate.minutes}m`;
  }, [routeDetails, speedSettings, calculateTime]);

  const handleSaveRoute = useCallback(
    async (routeData: SaveRouteData) => {
      if (!routeDetails || !routePoints.length) return;

      setSaveStatus({ loading: true, error: null });
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const anonymousId = !user ? crypto.randomUUID() : null;

        const routeInsert: RouteInsert = {
          user_id: user?.id || null,
          anonymous_id: anonymousId,
          name: routeData.name,
          description: routeData.description || null,
          route_type: routeData.type,
          activity_type: routeType,
          route_geometry: {
            type: "LineString",
            coordinates: routeDetails.geometry.coordinates,
          },
          distance: routeDetails.distance,
          estimated_duration: routeDetails.duration,
          is_private: routeData.isPrivate,
          metadata: {
            points: routePoints,
            speedSettings,
            createdAt: new Date().toISOString(),
          },
        };

        const { error: supabaseError } = await supabase
          .from("routes")
          .insert([routeInsert]);

        if (supabaseError) throw supabaseError;

        setShowSaveModal(false);
        setSaveStatus({ loading: false, error: null });
      } catch (error) {
        console.error("Save error:", error);
        setSaveStatus({
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to save route",
        });
      }
    },
    [routeDetails, routePoints, routeType, speedSettings]
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation(undefined);
        }
      );
    }
  }, []);

  return (
    <div className="h-screen flex flex-col relative">
      <Header
        routeType={routeType}
        onRouteTypeChange={handleRouteTypeChange}
        onSearch={handleSearch}
        onLocationSelect={handleLocationSelect}
        canSave={!!routeDetails && routePoints.length >= 2}
        onSave={() => setShowSaveModal(true)}
        onClear={handleClearRoute}
        hasRoute={routePoints.length > 0}
      />

      <Map
        routePoints={routePoints}
        onRoutePointsChange={handleRoutePointsChange}
        onRouteDetailsChange={setRouteDetails}
        routeType={routeType}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
        <StatsPanel
          routePoints={routePoints.length}
          routeDetails={routeDetails}
          speedSettings={speedSettings}
          calculateTime={calculateTime}
        />

        <SpeedControls
          speedSettings={speedSettings}
          onSpeedChange={setSpeedSettings}
        />
      </div>

      {showSaveModal && (
        <SaveRouteModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveRoute}
          distance={routeDetails?.distance || 0}
          estimatedTime={getTimeEstimate()}
          isLoading={saveStatus.loading}
          error={saveStatus.error}
          routeDetails={routeDetails}
        />
      )}
    </div>
  );
};

export default RouteCreator;
