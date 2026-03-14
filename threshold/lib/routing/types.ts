export type RouteMode = "walking" | "wheelchair" | "lower_stimulus" | "bus" | "car";

export type SegmentDifficulty = "easy" | "medium" | "hard";

export interface RouteSegment {
  coordinates: [number, number][];
  difficulty: SegmentDifficulty;
}

export interface GeocodedPlace {
  lat: number;
  lon: number;
  displayName: string;
}

export interface RouteInstruction {
  text: string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  wayPoints: [number, number];
}

export interface RouteConfidence {
  level: "high" | "medium" | "low";
  reasons: string[];
}

export interface PlannedRouteResult {
  start: { label: string; lat: number; lon: number };
  destination: { label: string; lat: number; lon: number };
  mode: RouteMode;
  routeProfile: string;
  summary: { durationMinutes: number; distanceMeters: number };
  instructions: RouteInstruction[];
  routeCoordinates: [number, number][]; // [lat, lon] pairs for map rendering
  routeSegments: RouteSegment[];        // coloured difficulty segments
  accessibilityNotes: string[];
  warnings: string[];
  transportNotes: string[];
  confidence: RouteConfidence;
}
