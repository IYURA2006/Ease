import { NextResponse } from "next/server";
import { geocodePlace } from "@/lib/routing/geocode";
import { getRoute } from "@/lib/routing/ors";
import { getVenueAccessContext } from "@/lib/routing/overpass";
import { applyHeuristics } from "@/lib/routing/heuristics";
import type { RouteMode, PlannedRouteResult, RouteSegment, SegmentDifficulty } from "@/lib/routing/types";

const VALID_MODES: RouteMode[] = ["walking", "wheelchair", "lower_stimulus", "bus", "car"];

// Loose bounding box covering the City of Edinburgh council area
const EDINBURGH_BOUNDS = { north: 56.00, south: 55.87, east: -3.00, west: -3.45 };

function isInEdinburgh(lat: number, lon: number): boolean {
  return (
    lat >= EDINBURGH_BOUNDS.south &&
    lat <= EDINBURGH_BOUNDS.north &&
    lon >= EDINBURGH_BOUNDS.west &&
    lon <= EDINBURGH_BOUNDS.east
  );
}

/** Classify a route step by difficulty based on instruction text and distance. */
function classifyStep(text: string, distanceMeters: number): SegmentDifficulty {
  const t = text.toLowerCase();

  // Hard: very short manoeuvres, roundabout exits, sharp turns
  if (distanceMeters < 25) return "hard";
  if (/roundabout|exit the roundabout|sharp/i.test(t) && distanceMeters < 100) return "hard";

  // Easy: going straight, long clear stretches, arrival
  if (/head|continue|straight|arrive|destination/i.test(t) && distanceMeters > 120) return "easy";
  if (distanceMeters > 300) return "easy";

  // Everything else: turns, keep left/right, merges
  return "medium";
}

/** Build coloured segments from route coordinates + per-step waypoint indices. */
function buildSegments(
  coords: [number, number][],
  instructions: { text: string; distanceMeters: number; wayPoints: [number, number] }[]
): RouteSegment[] {
  return instructions
    .map((instr) => {
      const [from, to] = instr.wayPoints;
      const slice = coords.slice(from, to + 1);
      if (slice.length < 2) return null;
      return {
        coordinates: slice,
        difficulty: classifyStep(instr.text, instr.distanceMeters),
      } satisfies RouteSegment;
    })
    .filter((s): s is RouteSegment => s !== null);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { start, destination, mode } = body as {
      start?: string;
      destination?: string;
      mode?: string;
    };

    if (!start?.trim() || !destination?.trim()) {
      return NextResponse.json(
        { error: "start and destination are required" },
        { status: 400 }
      );
    }

    if (!mode || !VALID_MODES.includes(mode as RouteMode)) {
      return NextResponse.json(
        { error: "mode must be walking, wheelchair, or lower_stimulus" },
        { status: 400 }
      );
    }

    const routeMode = mode as RouteMode;

    const [startPlace, destPlace] = await Promise.all([
      geocodePlace(start.trim()),
      geocodePlace(destination.trim()),
    ]);

    if (!isInEdinburgh(startPlace.lat, startPlace.lon)) {
      return NextResponse.json(
        { error: `"${start.trim()}" appears to be outside Edinburgh. This planner covers Edinburgh journeys only.` },
        { status: 422 }
      );
    }
    if (!isInEdinburgh(destPlace.lat, destPlace.lon)) {
      return NextResponse.json(
        { error: `"${destination.trim()}" appears to be outside Edinburgh. This planner covers Edinburgh journeys only.` },
        { status: 422 }
      );
    }

    const route = await getRoute(
      startPlace.lat,
      startPlace.lon,
      destPlace.lat,
      destPlace.lon,
      routeMode
    );

    let overpass = null;
    try {
      overpass = await getVenueAccessContext(destPlace.lat, destPlace.lon);
    } catch {
      // non-fatal
    }

    const { accessibilityNotes, warnings, transportNotes, confidence } = applyHeuristics(
      routeMode,
      route,
      overpass
    );

    const routeSegments = buildSegments(
      route.routeCoordinates,
      route.instructions.map((i) => ({
        text: i.text,
        distanceMeters: i.distanceMeters,
        wayPoints: i.wayPoints,
      }))
    );

    const result: PlannedRouteResult = {
      start: { label: startPlace.displayName, lat: startPlace.lat, lon: startPlace.lon },
      destination: { label: destPlace.displayName, lat: destPlace.lat, lon: destPlace.lon },
      mode: routeMode,
      routeProfile: route.profile,
      summary: {
        durationMinutes: Math.round(route.durationSeconds / 60),
        distanceMeters: Math.round(route.distanceMeters),
      },
      instructions: route.instructions.map((s) => ({
        text: s.text,
        distanceMeters: s.distanceMeters,
        durationSeconds: s.durationSeconds,
        wayPoints: s.wayPoints,
      })),
      routeCoordinates: route.routeCoordinates,
      routeSegments,
      accessibilityNotes,
      warnings,
      transportNotes,
      confidence,
    };

    return NextResponse.json(result);
  } catch (e) {
    console.error("route/plan error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Route planning failed" },
      { status: 500 }
    );
  }
}
