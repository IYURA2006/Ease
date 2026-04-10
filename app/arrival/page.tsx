"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { PlannedRouteResult, RouteMode } from "@/lib/routing/types";
import { ArrivalPlannerForm } from "@/components/arrival/ArrivalPlannerForm";
import { RouteSummaryCard } from "@/components/arrival/RouteSummaryCard";

// Leaflet requires the DOM — must be loaded client-side only
const RouteMap = dynamic(
  () => import("@/components/arrival/RouteMap").then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full animate-pulse rounded-xl bg-stone-100" />
    ),
  }
);

export default function ArrivalPage() {
  const searchParams = useSearchParams();
  const venueParam = searchParams.get("venue") ?? "";

  const [start, setStart] = useState("");
  const [destination, setDestination] = useState(venueParam);
  const [mode, setMode] = useState<RouteMode>("walking");
  const [result, setResult] = useState<PlannedRouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/route/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: start.trim(), destination: destination.trim(), mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not plan a route. Please try again.");
        return;
      }

      setResult(data as PlannedRouteResult);
    } catch {
      setError("Could not reach the routing service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal">
            Safe route
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-semibold text-text-primary">
            Journey Planner
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left — form */}
          <div className="relative z-10 lg:col-span-2">
            <div className="rounded-xl border border-stone-200 bg-surface p-6 shadow-sm">
              <ArrivalPlannerForm
                start={start}
                setStart={setStart}
                destination={destination}
                setDestination={setDestination}
                mode={mode}
                setMode={setMode}
                onSubmit={handleSubmit}
                loading={loading}
                prefillVenueLabel={venueParam || undefined}
                onPrefillVenue={venueParam ? () => setDestination(venueParam) : undefined}
              />
            </div>

            <p className="mt-4 text-xs text-text-secondary">
              Routing via <span className="font-medium">OpenRouteService</span>. Accessibility
              metadata from <span className="font-medium">OpenStreetMap</span> via Overpass.
              Geocoding via <span className="font-medium">Nominatim</span>.
            </p>
          </div>

          {/* Right — map always visible here, result below when ready */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-dusty-rose/40 bg-dusty-rose/5 p-4"
              >
                <p className="font-medium text-dusty-rose">Could not plan route</p>
                <p className="mt-1 text-sm text-text-secondary">{error}</p>
              </div>
            )}

            {/* Map — Edinburgh by default, updates with coloured route once planned */}
            <div className="isolate overflow-hidden rounded-xl border border-stone-200 shadow-sm">
              <RouteMap
                className="h-[420px] w-full"
                routeSegments={result?.routeSegments}
                startLat={result?.start.lat}
                startLon={result?.start.lon}
                destLat={result?.destination.lat}
                destLon={result?.destination.lon}
              />
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-3 rounded-xl border border-stone-200 bg-surface p-5">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-teal" />
                <p className="text-sm text-text-secondary">Calculating route…</p>
              </div>
            )}

            {/* Empty state (only before first attempt) */}
            {!result && !error && !loading && (
              <p className="text-center text-sm text-text-secondary">
                Enter your start and destination to plan a route.
              </p>
            )}

            {/* Result card */}
            {result && !loading && <RouteSummaryCard result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}
