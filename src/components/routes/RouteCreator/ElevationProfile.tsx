// src/components/routes/RouteCreator/ElevationProfile.tsx

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RouteDetails } from "./types";
import * as turf from "@turf/turf";
import { Feature, LineString } from "geojson";

interface ElevationProfileProps {
  routeDetails: RouteDetails | null;
  mapboxToken: string;
  map: mapboxgl.Map | null;
}

interface ElevationPoint {
  distance: number;
  elevation: number;
}

const ElevationProfile: React.FC<ElevationProfileProps> = ({
  routeDetails,
  map,
}) => {
  const [elevationData, setElevationData] = useState<ElevationPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateElevationProfile = async () => {
      if (!routeDetails?.geometry.coordinates.length || !map) {
        setElevationData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const lineString: Feature<LineString> = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeDetails.geometry.coordinates,
          },
        };

        // Split the line into 100m segments
        const chunks = turf.lineChunk(lineString, 0.1, { units: "kilometers" });
        let cumulativeDistance = 0;
        const points: ElevationPoint[] = [];

        // Process each chunk
        for (const chunk of chunks.features) {
          // Calculate distance from start for all but first point
          if (points.length > 0) {
            const prevCoord = points[points.length - 1];
            const currentCoord = chunk.geometry.coordinates[0];
            const distance = turf.distance(
              turf.point(currentCoord),
              turf.point([prevCoord.distance, currentCoord[1]]),
              { units: "kilometers" }
            );
            cumulativeDistance += distance;
          }

          // Get elevation for this point
          const elevation = map.queryTerrainElevation(
            chunk.geometry.coordinates[0] as [number, number]
          );

          points.push({
            distance: cumulativeDistance,
            elevation: elevation || 0,
          });
        }

        // Add the final point of the last chunk
        const lastChunk = chunks.features[chunks.features.length - 1];
        if (lastChunk) {
          const lastCoord =
            lastChunk.geometry.coordinates[
              lastChunk.geometry.coordinates.length - 1
            ];
          const lastElevation = map.queryTerrainElevation(
            lastCoord as [number, number]
          );
          const totalDistance = turf.length(lineString, {
            units: "kilometers",
          });

          points.push({
            distance: totalDistance,
            elevation: lastElevation || 0,
          });
        }

        setElevationData(points);
      } catch (err) {
        console.error("Error creating elevation profile:", err);
        setError("Failed to load elevation data");
      } finally {
        setLoading(false);
      }
    };

    // Only update when the map is ready and terrain is loaded
    if (map) {
      const terrainSource = map.getSource("mapbox-dem");
      if (!terrainSource) {
        // Add terrain source if it doesn't exist
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
      }

      map.once("idle", updateElevationProfile);
    }

    return () => {
      if (map) {
        map.off("idle", updateElevationProfile);
      }
    };
  }, [routeDetails, map]);

  // Rest of your component remains the same...
  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        Loading elevation data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-32 flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!elevationData.length) {
    return null;
  }

  const elevationStats = {
    min: Math.min(...elevationData.map((p) => p.elevation)),
    max: Math.max(...elevationData.map((p) => p.elevation)),
    gain: elevationData.reduce((acc, point, i) => {
      if (i === 0) return 0;
      const gain = point.elevation - elevationData[i - 1].elevation;
      return acc + (gain > 0 ? gain : 0);
    }, 0),
  };

  return (
    <div className="h-32 w-full p-2">
      <div className="text-xs text-gray-600 mb-1 flex justify-between px-4">
        <span>Gain: {Math.round(elevationStats.gain)}m</span>
        <span>Max: {Math.round(elevationStats.max)}m</span>
        <span>Min: {Math.round(elevationStats.min)}m</span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={elevationData}
          margin={{ top: 5, right: 20, bottom: 20, left: 20 }}
        >
          <XAxis
            dataKey="distance"
            label={{ value: "Distance (km)", position: "bottom" }}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <YAxis
            label={{
              value: "Elevation (m)",
              angle: -90,
              position: "insideLeft",
            }}
            domain={[
              (dataMin: number) => Math.floor(dataMin - 10),
              (dataMax: number) => Math.ceil(dataMax + 10),
            ]}
          />
          <Tooltip
            formatter={(value: number) => [
              `${Math.round(value)}m`,
              "Elevation",
            ]}
            labelFormatter={(label: number) =>
              `Distance: ${label.toFixed(1)}km`
            }
          />
          <Line
            type="monotone"
            dataKey="elevation"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ElevationProfile;
