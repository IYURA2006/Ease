"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const HAS_MAPS = typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

function RouteContent() {
  const searchParams = useSearchParams();
  const venueParam = searchParams.get("venue") ?? "";
  const [origin, setOrigin] = useState("");
  const [venue, setVenue] = useState(venueParam);
  const [avoidBusy, setAvoidBusy] = useState(false);
  const [stepFree, setStepFree] = useState(false);
  const [avoidConstruction, setAvoidConstruction] = useState(false);
  const [quietRoute, setQuietRoute] = useState(false);
  const [addBuffer, setAddBuffer] = useState(false);
  const [directions, setDirections] = useState<string[]>([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [sensoryNotes, setSensoryNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVenue((v) => (venueParam && !v ? venueParam : v));
  }, [venueParam]);

  const handleFindRoute = () => {
    setLoading(true);
    setDirections([]);
    setDistance("");
    setDuration("");
    setSensoryNotes([]);
    if (HAS_MAPS) {
      // Placeholder: real implementation would use Google Maps Directions API
      setTimeout(() => {
        setDirections([
          "Head north on your current street",
          "Turn right onto the main road",
          "Continue for 0.5 miles",
          "Venue is on your left",
        ]);
        setDistance("1.2 miles");
        setDuration(addBuffer ? "22 min" : "18 min");
        setSensoryNotes([
          "This section passes Edinburgh Waverley station — expect crowds and noise around 5-6pm",
        ]);
        setLoading(false);
      }, 800);
    } else {
      setDirections([
        "Head north on your current street",
        "Turn right onto the main road",
        "Continue for 0.5 miles",
        "Venue is on your left",
      ]);
      setDistance("1.2 miles");
      setDuration(addBuffer ? "22 min" : "18 min");
      setSensoryNotes([
        "This section passes Edinburgh Waverley station — expect crowds and noise around 5-6pm",
      ]);
      setLoading(false);
    }
  };

  const handleSaveRoute = () => window.print();
  const handleShareRoute = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-playfair text-3xl font-semibold text-text-primary">
          Safe Route
        </h1>
        <p className="mt-2 text-text-secondary">
          Find a quieter, more accessible route to your venue.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-text-primary">
                Where are you starting from?
              </span>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Address or place"
                className="mt-1 w-full rounded-lg border border-stone-300 bg-surface px-4 py-2 text-text-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text-primary">
                Which venue?
              </span>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Venue name or address"
                className="mt-1 w-full rounded-lg border border-stone-300 bg-surface px-4 py-2 text-text-primary"
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-text-primary">
                Accessibility preferences
              </legend>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={avoidBusy}
                  onChange={(e) => setAvoidBusy(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-text-primary">
                  Avoid busy roads and crowds
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={stepFree}
                  onChange={(e) => setStepFree(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-text-primary">Step-free route only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={avoidConstruction}
                  onChange={(e) => setAvoidConstruction(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-text-primary">Avoid construction noise</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={quietRoute}
                  onChange={(e) => setQuietRoute(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-text-primary">
                  Minimise sensory load (quieter streets)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addBuffer}
                  onChange={(e) => setAddBuffer(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-text-primary">
                  I need more time — add buffer to journey estimate
                </span>
              </label>
            </fieldset>

            <button
              type="button"
              onClick={handleFindRoute}
              disabled={loading}
              className="w-full rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-50"
            >
              {loading ? "Finding route…" : "Find my route"}
            </button>
          </div>

          <div className="lg:col-span-3">
            {HAS_MAPS ? (
              <div
                ref={mapRef}
                className="h-80 w-full rounded-lg border border-stone-200 bg-stone-100"
              >
                Map would load here with NEXT_PUBLIC_GOOGLE_MAPS_KEY
              </div>
            ) : (
              <div className="flex h-80 flex-col items-center justify-center rounded-lg border border-stone-200 bg-stone-50/50 p-6 text-center">
                <p className="text-text-secondary">
                  Maps integration ready — add <code className="rounded bg-stone-200 px-1">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> to enable.
                </p>
                <p className="mt-2 text-sm text-text-secondary">
                  The route will appear here with a teal highlight and step-by-step directions below.
                </p>
              </div>
            )}

            {(directions.length > 0 || distance) && (
              <div className="mt-6 rounded-lg border border-stone-200 bg-surface p-6 no-print">
                <div className="flex gap-4 text-sm">
                  {distance && <span className="font-medium text-text-primary">{distance}</span>}
                  {duration && (
                    <span className="text-text-secondary">
                      {addBuffer ? "~" : ""}{duration} (journey time)
                    </span>
                  )}
                </div>
                <ol className="mt-4 list-decimal list-inside space-y-2 text-text-primary">
                  {directions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                {sensoryNotes.length > 0 && (
                  <div className="mt-4 rounded bg-amber/10 p-3 text-sm text-amber-900">
                    <p className="font-medium">Sensory notes</p>
                    <ul className="mt-1 list-inside list-disc">
                      {sensoryNotes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveRoute}
                    className="rounded border border-stone-300 px-3 py-2 text-sm font-medium text-text-primary hover:bg-stone-100"
                  >
                    Save route
                  </button>
                  <button
                    type="button"
                    onClick={handleShareRoute}
                    className="rounded border border-stone-300 px-3 py-2 text-sm font-medium text-text-primary hover:bg-stone-100"
                  >
                    Share route
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoutePage() {
  return (
    <Suspense>
      <RouteContent />
    </Suspense>
  );
}
