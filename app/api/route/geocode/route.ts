import { NextResponse } from "next/server";
import { geocodePlace } from "@/lib/routing/geocode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body as { query?: string };

    if (!query?.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const result = await geocodePlace(query.trim());
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Geocoding failed" },
      { status: 500 }
    );
  }
}
