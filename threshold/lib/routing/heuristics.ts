import type { RouteMode, RouteConfidence } from "./types";
import type { NormalizedRoute } from "./ors";
import type { VenueAccessContext } from "./overpass";

interface HeuristicResult {
  accessibilityNotes: string[];
  warnings: string[];
  transportNotes: string[];
  confidence: RouteConfidence;
}

export function applyHeuristics(
  mode: RouteMode,
  route: NormalizedRoute,
  overpass: VenueAccessContext | null
): HeuristicResult {
  const notes: string[] = [];
  const warnings: string[] = [];
  const transportNotes: string[] = [];
  const confidenceReasons: string[] = [];
  let confidenceLevel: "high" | "medium" | "low" = "high";

  // Mode-specific notes
  if (mode === "wheelchair") {
    notes.push("A wheelchair-friendly route profile was used.");
    warnings.push("Wheelchair suitability depends on the accuracy of OpenStreetMap data.");
  }

  if (mode === "lower_stimulus") {
    notes.push("A lower-stimulus estimate was applied — a walking route with fewer turns is preferred.");
    warnings.push("This is a lower-stimulus estimate, not a live noise or crowd measurement.");

    const turnCount = route.instructions.filter((s) =>
      /turn|left|right|roundabout/i.test(s.text)
    ).length;

    if (turnCount <= 3) {
      notes.push("This route has relatively few turns — it may feel easier to follow.");
    } else if (turnCount > 6) {
      warnings.push("This route has several turns. Consider leaving extra time to navigate calmly.");
    }
  }

  // Overpass-derived accessibility notes
  if (overpass === null) {
    warnings.push("Accessibility tagging is limited near the venue — map data could not be retrieved.");
    confidenceLevel = "low";
    confidenceReasons.push("Overpass metadata unavailable.");
  } else {
    if (overpass.rawTagCount === 0) {
      warnings.push("Accessibility tagging is limited near the venue.");
      if (confidenceLevel === "high") confidenceLevel = "medium";
      confidenceReasons.push("No accessibility tags found near the venue.");
    } else {
      confidenceReasons.push("Useful accessibility metadata was found near the venue.");
    }

    if (overpass.hasToilets) {
      notes.push("Accessible toilets are mapped near the venue.");
    }

    if (overpass.hasSteps) {
      warnings.push("Steps are mapped close to the destination — check with the venue for a step-free route.");
      if (mode === "wheelchair") {
        confidenceLevel = "medium";
        confidenceReasons.push("Steps mapped near venue despite wheelchair profile.");
      }
    }

    if (overpass.hasWheelchairData && overpass.wheelchairAccessible === true) {
      notes.push("Map data suggests wheelchair-accessible features near the venue.");
    } else if (overpass.hasWheelchairData && overpass.wheelchairAccessible === false) {
      warnings.push("Some map features near the venue are tagged as not wheelchair-accessible.");
      if (confidenceLevel === "high") confidenceLevel = "medium";
      confidenceReasons.push("Wheelchair:no tags found near venue.");
    }

    if (overpass.hasAccessibleEntrance) {
      notes.push("An accessible entrance is mapped near the venue.");
    } else {
      warnings.push("Main entrance accessibility may need confirmation with the venue directly.");
    }

    if (overpass.hasBarriers) {
      warnings.push("Barriers are mapped near the venue — check access on the day.");
    }

    if (overpass.hasCrossings) {
      notes.push("Pedestrian crossings are mapped on the approach to the venue.");
    }

    // Public transport notes
    if (overpass.nearbyBusStops > 0) {
      transportNotes.push(
        `${overpass.nearbyBusStops} bus stop${overpass.nearbyBusStops === 1 ? "" : "s"} mapped within ~600 m of the venue.`
      );
    }
    if (overpass.hasTrainStation) {
      transportNotes.push("A train or subway station is mapped near the venue.");
    }
    if (overpass.hasTramStop) {
      transportNotes.push("A tram stop is mapped near the venue.");
    }
    if (overpass.nearbyBusStops === 0 && !overpass.hasTrainStation && !overpass.hasTramStop) {
      transportNotes.push("No public transport stops were found in the immediate area — check Traveline Scotland or Google Maps for live departures.");
    }
  }

  // Short journey note
  if (route.durationSeconds < 600) {
    notes.push("This is a short journey — you can take it at your own pace.");
  }

  // Finalize confidence reasons
  if (confidenceReasons.length === 0) {
    confidenceReasons.push("Route found and venue geocoded cleanly.");
  }

  return {
    accessibilityNotes: notes,
    warnings,
    transportNotes,
    confidence: { level: confidenceLevel, reasons: confidenceReasons },
  };
}
