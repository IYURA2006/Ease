const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  tags?: Record<string, string>;
}

export interface VenueAccessContext {
  hasWheelchairData: boolean;
  wheelchairAccessible: boolean | null; // null = unknown
  hasToilets: boolean;
  hasSteps: boolean;
  hasAccessibleEntrance: boolean;
  hasBarriers: boolean;
  hasCrossings: boolean;
  rawTagCount: number;
  // Public transport
  nearbyBusStops: number;
  hasTrainStation: boolean;
  hasTramStop: boolean;
}

export async function getVenueAccessContext(
  lat: number,
  lon: number,
  radiusMeters = 400
): Promise<VenueAccessContext> {
  const r = radiusMeters;
  const rt = Math.round(r * 1.5); // larger radius for transit

  const query = `
[out:json][timeout:12];
(
  node(around:${r},${lat},${lon})[wheelchair];
  node(around:${r},${lat},${lon})[entrance];
  node(around:${r},${lat},${lon})[amenity=toilets];
  node(around:${r},${lat},${lon})[barrier];
  node(around:${r},${lat},${lon})[highway=steps];
  node(around:${r},${lat},${lon})[kerb];
  node(around:${r},${lat},${lon})[crossing];
  node(around:${rt},${lat},${lon})[highway=bus_stop];
  node(around:${rt},${lat},${lon})[amenity=bus_station];
  node(around:${rt},${lat},${lon})[railway=station];
  node(around:${rt},${lat},${lon})[railway=subway_entrance];
  node(around:${rt},${lat},${lon})[railway=tram_stop];
);
out body;
`.trim();

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(14000),
  });

  if (!res.ok) throw new Error(`Overpass API returned ${res.status}`);

  const data = await res.json();
  const elements: OverpassElement[] = data.elements ?? [];
  const withTags = elements.filter((e) => e.tags && Object.keys(e.tags).length > 0);

  const wheelchairNodes = withTags.filter((e) => e.tags?.wheelchair);
  const hasWheelchairData = wheelchairNodes.length > 0;
  const isAccessible = wheelchairNodes.some(
    (e) => e.tags?.wheelchair === "yes" || e.tags?.wheelchair === "designated"
  );
  const isInaccessible = wheelchairNodes.some((e) => e.tags?.wheelchair === "no");

  const busStops = withTags.filter(
    (e) => e.tags?.highway === "bus_stop" || e.tags?.amenity === "bus_station"
  );

  return {
    hasWheelchairData,
    wheelchairAccessible: hasWheelchairData ? isAccessible && !isInaccessible : null,
    hasToilets: withTags.some((e) => e.tags?.amenity === "toilets"),
    hasSteps: withTags.some((e) => e.tags?.highway === "steps"),
    hasAccessibleEntrance: withTags.some(
      (e) => e.tags?.entrance === "yes" || e.tags?.entrance === "main"
    ),
    hasBarriers: withTags.some(
      (e) => e.tags?.barrier && e.tags.barrier !== "entrance"
    ),
    hasCrossings: withTags.some((e) => !!e.tags?.crossing),
    rawTagCount: withTags.length,
    nearbyBusStops: busStops.length,
    hasTrainStation: withTags.some(
      (e) => e.tags?.railway === "station" || e.tags?.railway === "subway_entrance"
    ),
    hasTramStop: withTags.some((e) => e.tags?.railway === "tram_stop"),
  };
}
