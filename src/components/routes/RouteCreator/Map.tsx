// src/components/routes/RouteCreator/Map.tsx

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { RoutePoint, RouteDetails } from "./types";
import ElevationProfile from "./ElevationProfile";

// Initialize Mapbox with access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapProps {
  routePoints: RoutePoint[];
  onRoutePointsChange: (points: RoutePoint[]) => void;
  onRouteDetailsChange: (details: RouteDetails | null) => void;
  routeType: "cycling" | "walking";
}

const Map: React.FC<MapProps> = ({
  routePoints,
  onRoutePointsChange,
  onRouteDetailsChange,
  routeType,
}) => {
  // Refs for managing map state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const sourceAddedRef = useRef(false);

  // State management
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [routeDetailsState, setRouteDetailsState] =
    useState<RouteDetails | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log("Initializing map...");

    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.006, 40.7128], // Default center (will be updated with user location)
      zoom: 13,
    });

    map.current = initializeMap;

    initializeMap.on("load", () => {
      console.log("Map loaded, setting up terrain and controls...");

      // Add terrain source for elevation data
      initializeMap.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      initializeMap.setTerrain({ source: "mapbox-dem", exaggeration: 1 });
      initializeMap.addControl(new mapboxgl.NavigationControl(), "top-right");
      setMapInstance(initializeMap);

      // Bind click handler after map loads
      initializeMap.on("click", handleMapClick);

      // Center on user location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Got user location, centering map...");
            const { latitude, longitude } = position.coords;

            // Only center on user location if this is the initial load
            // and no route points exist
            if (isInitialLoad && routePoints.length === 0) {
              initializeMap.flyTo({
                center: [longitude, latitude],
                zoom: 14,
                essential: true,
              });
              setIsInitialLoad(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setIsInitialLoad(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    });

    return () => {
      if (map.current) {
        map.current.off("click", handleMapClick);
        map.current.remove();
        map.current = null;
        setMapInstance(null);
      }
    };
  }, []);

  // Handle map clicks to add new route points
  const handleMapClick = (
    e: mapboxgl.MapMouseEvent & { lngLat: mapboxgl.LngLat }
  ) => {
    console.log("Map clicked, adding new point...");

    // Create a new point with unique ID
    const newPoint: RoutePoint = {
      id: Math.random().toString(36).substr(2, 9),
      coordinates: [e.lngLat.lng, e.lngLat.lat],
    };

    // Add the new point to existing points
    onRoutePointsChange([...routePoints, newPoint]);
  };

  // Update markers and route when points change
  useEffect(() => {
    if (!map.current) return;

    console.log("Updating markers and route for", routePoints.length, "points");

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers for each point
    routePoints.forEach((point, index) => {
      // Create marker element with custom styling
      const el = document.createElement("div");
      el.className = "route-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";

      // Set color based on marker position
      el.style.backgroundColor =
        index === 0
          ? "#22c55e" // Start point (green)
          : index === routePoints.length - 1
          ? "#ef4444" // End point (red)
          : "#3b82f6"; // Waypoint (blue)

      // Create and add the marker
      const marker = new mapboxgl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat(point.coordinates)
        .addTo(map.current!);

      // Handle marker drag events
      marker.on("dragstart", () => {
        el.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
      });

      marker.on("dragend", () => {
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        const newLngLat = marker.getLngLat();
        const updatedPoints = [...routePoints];
        updatedPoints[index].coordinates = [newLngLat.lng, newLngLat.lat];
        onRoutePointsChange(updatedPoints);
      });

      markersRef.current.push(marker);
    });

    // Update route if we have at least 2 points
    if (routePoints.length >= 2) {
      fetchRoute();
    } else {
      // Clear existing route if fewer than 2 points
      onRouteDetailsChange(null);
      if (map.current.getSource("route")) {
        map.current.removeLayer("route-line");
        map.current.removeSource("route");
        sourceAddedRef.current = false;
      }
    }
  }, [routePoints, routeType]);

  // Fetch route data from Mapbox API
  const fetchRoute = async () => {
    if (!map.current || routePoints.length < 2) return;

    const coordinates = routePoints
      .map((point) => point.coordinates)
      .map((coord) => coord.join(","))
      .join(";");

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${routeType}/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const routeDetails: RouteDetails = {
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          geometry: data.routes[0].geometry,
        };

        onRouteDetailsChange(routeDetails);
        setRouteDetailsState(routeDetails);

        // Fit the map to show the entire route on first creation
        if (routePoints.length === 2) {
          const coordinates = data.routes[0].geometry.coordinates;
          const bounds = coordinates.reduce(
            (
              bounds: { extend: (arg0: [number, number]) => any },
              coord: [number, number]
            ) => {
              return bounds.extend(coord as [number, number]);
            },
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );

          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15,
          });
        }

        updateMapRoute(data.routes[0].geometry.coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      onRouteDetailsChange(null);
    }
  };

  // Update the route line on the map
  const updateMapRoute = (coordinates: [number, number][]) => {
    if (!map.current) return;

    console.log("Updating route line with", coordinates.length, "coordinates");

    // Remove existing route if present
    if (sourceAddedRef.current) {
      map.current.removeLayer("route-line");
      map.current.removeSource("route");
    }

    // Add new route data
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    });

    // Add route line layer with enhanced styling
    map.current.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": routeType === "cycling" ? "#3b82f6" : "#10b981",
        "line-width": 4,
        "line-opacity": 0.8,
        "line-blur": 1,
      },
    });

    sourceAddedRef.current = true;
  };

  return (
    <>
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ bottom: "152px" }}
      />
      <div className="absolute bottom-[152px] left-0 right-0 bg-white border-t">
        <ElevationProfile
          routeDetails={routeDetailsState}
          map={mapInstance}
          mapboxToken={mapboxgl.accessToken}
        />
      </div>
    </>
  );
};

export default Map;
