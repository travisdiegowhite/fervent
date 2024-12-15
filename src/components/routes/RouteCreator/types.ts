// src/components/routes/RouteCreator/types.ts

export interface RoutePoint {
  id: string;
  coordinates: [number, number];
}

export interface RouteDetails {
  distance: number;
  duration: number;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

export interface SearchResult {
  text: string;
  center: [number, number];
}

export interface SpeedSettings {
  speed: number;
  unit: "mph" | "kph";
}

export interface RouteTimeEstimate {
  hours: number;
  minutes: number;
}

export interface SaveRouteData {
  name: string;
  description: string;
  type: "leisure" | "training" | "commute";
  isPrivate: boolean;
}

export type RouteInsert = {
  user_id: string | null;
  anonymous_id: string | null;
  name: string;
  description: string | null;
  route_type: "leisure" | "training" | "commute";
  activity_type: "cycling" | "walking";
  route_geometry: {
    type: "LineString";
    coordinates: number[][];
  };
  distance: number;
  estimated_duration: number;
  is_private: boolean;
  metadata: any;
};

export interface SaveStatus {
  loading: boolean;
  error: string | null;
}

export interface RoutePoint {

  // Define the properties of RoutePoint here

}



export interface RouteMetadata {

  scenicScore: number;

  difficultyScore: number;

  safetyNotes?: string[];

}