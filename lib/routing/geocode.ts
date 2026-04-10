import type { GeocodedPlace } from "./types";

export async function geocodePlace(query: string): Promise<GeocodedPlace> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Threshold-SensoryPassport/1.0 (accessibility-hackathon)",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding service returned ${res.status}. Try again shortly.`);
  }

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `Could not find a location matching "${query}". Try a more specific address.`
    );
  }

  const first = data[0];
  return {
    lat: parseFloat(first.lat),
    lon: parseFloat(first.lon),
    displayName: first.display_name ?? query,
  };
}
