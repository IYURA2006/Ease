const ORS_BASE = "https://api.openrouteservice.org/v2/directions";

const PROFILE_MAP: Record<string, string> = {
  walking: "foot-walking",
  wheelchair: "wheelchair",
  lower_stimulus: "foot-walking",
};

// Friendly messages keyed to ORS error codes
function friendlyOrsError(code: number | undefined, mode: string): string {
  if (mode === "wheelchair") {
    return "No wheelchair-accessible route was found between these locations. The area may not have enough mapped accessible paths — try the walking route instead.";
  }
  if (code === 2003) {
    return "One of the locations couldn't be reached. Try adding a street name or nearby landmark.";
  }
  if (code === 2009 || code === 2010 || code === 2099) {
    return "No route could be found between these two points. Check the addresses and try again.";
  }
  return "No route found between these locations. Try adjusting the start or destination.";
}

interface ORSStep {
  instruction: string;
  distance: number;
  duration: number;
  way_points: [number, number]; // start/end indices into geometry.coordinates
}

// GeoJSON response shape from /directions/{profile}/geojson
interface ORSGeoJSONResponse {
  type: "FeatureCollection";
  features: [
    {
      type: "Feature";
      properties: {
        summary: { distance: number; duration: number };
        segments: { steps: ORSStep[] }[];
      };
      geometry: {
        type: "LineString";
        coordinates: [number, number][]; // [lon, lat]
      };
    }
  ];
}

export interface NormalizedRoute {
  profile: string;
  durationSeconds: number;
  distanceMeters: number;
  instructions: {
    text: string;
    distanceMeters: number;
    durationSeconds: number;
    wayPoints: [number, number]; // start/end indices into routeCoordinates
  }[];
  routeCoordinates: [number, number][]; // [lat, lon] pairs for Leaflet
}

export async function getRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  mode: string
): Promise<NormalizedRoute> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) throw new Error("Routing is not configured on this server.");

  const profile = PROFILE_MAP[mode] ?? "foot-walking";
  const url = `${ORS_BASE}/${profile}/geojson`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json, application/geo+json",
    },
    body: JSON.stringify({
      coordinates: [
        [startLon, startLat],
        [endLon, endLat],
      ],
    }),
  });

  if (!res.ok) {
    let code: number | undefined;
    try {
      const errJson = await res.json();
      code = errJson?.error?.code;
    } catch { /* not JSON */ }
    throw new Error(friendlyOrsError(code, mode));
  }

  const data: ORSGeoJSONResponse = await res.json();
  const feature = data.features?.[0];
  if (!feature) {
    throw new Error(friendlyOrsError(undefined, mode));
  }

  const steps = feature.properties.segments.flatMap((seg) => seg.steps);

  // ORS returns [lon, lat]; Leaflet expects [lat, lon]
  const routeCoordinates: [number, number][] = feature.geometry.coordinates.map(
    ([lon, lat]) => [lat, lon]
  );

  return {
    profile,
    durationSeconds: feature.properties.summary.duration,
    distanceMeters: feature.properties.summary.distance,
    instructions: steps.map((s) => ({
      text: s.instruction,
      distanceMeters: s.distance,
      durationSeconds: s.duration,
      wayPoints: s.way_points ?? [0, routeCoordinates.length - 1],
    })),
    routeCoordinates,
  };
}
