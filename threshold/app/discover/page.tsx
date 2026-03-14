"use client";

import { useState, useEffect, useCallback } from "react";
import { EventCard } from "@/components/EventCard";
import { fetchEvents } from "@/lib/eventApi";
import type { Event as EventType, EventFilters } from "@/lib/types";
import { QRScanner } from "@/components/QRScanner";

const SENSORY_OPTIONS = [
  { value: "all", label: "All intensities" },
  { value: "low", label: "Low sensory" },
  { value: "low_medium", label: "Low + Medium only" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All events" },
  { value: "theatre", label: "Theatre" },
  { value: "music", label: "Music" },
  { value: "exhibition", label: "Exhibition" },
  { value: "comedy", label: "Comedy" },
  { value: "dance", label: "Dance" },
];

const ACCESSIBILITY_CHIPS = [
  "BSL interpreted",
  "Audio described",
  "Relaxed performance",
  "Step-free access",
  "No strobes",
  "No sudden sounds",
];

function filterEvents(events: EventType[], filters: EventFilters): EventType[] {
  let out = [...events];

  if (filters.sensoryLevel === "low") {
    out = out.filter((e) =>
      (["sound", "light", "touch", "content", "space"] as const).every(
        (k) => e.fingerprint[k]?.level === "low"
      )
    );
  } else if (filters.sensoryLevel === "low_medium") {
    out = out.filter((e) =>
      (["sound", "light", "touch", "content", "space"] as const).every((k) => {
        const level = e.fingerprint[k]?.level;
        return level === "low" || level === "medium";
      })
    );
  }

  if (filters.eventType && filters.eventType !== "all") {
    out = out.filter((e) => e.eventType === filters.eventType);
  }

  if (filters.accessibility?.length) {
    out = out.filter((e) =>
      filters.accessibility!.some((tag) =>
        e.fingerprint.accessibilityFeatures?.includes(tag)
      )
    );
  }

  return out;
}

export default function DiscoverPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sensoryLevel, setSensoryLevel] = useState<EventFilters["sensoryLevel"]>("all");
  const [eventType, setEventType] = useState<string>("all");
  const [accessibility, setAccessibility] = useState<string[]>([]);
  const [qrOpen, setQrOpen] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const data = await fetchEvents();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const toggleAccessibility = (chip: string) => {
    setAccessibility((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const filtered = filterEvents(events, {
    sensoryLevel,
    eventType: eventType === "all" ? undefined : eventType,
    accessibility: accessibility.length ? accessibility : undefined,
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-surface/50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-playfair text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Arts and culture, built around you.
          </h1>
          <p className="mt-4 text-lg text-text-secondary">
            Every event listed here has a verified Threshold Sensory Passport — honest,
            specific accessibility information so you can decide with confidence.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-32 w-48 rounded-lg bg-gradient-to-br from-sage/30 via-amber/20 to-dusty-rose/20" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 border-b border-stone-200 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Sensory:</span>
            {SENSORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSensoryLevel(opt.value as EventFilters["sensoryLevel"])}
                className={`rounded-full px-3 py-1 text-sm ${
                  sensoryLevel === opt.value
                    ? "bg-teal text-white"
                    : "bg-stone-200 text-text-primary hover:bg-stone-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <span className="ml-2 text-sm font-medium text-text-secondary">Type:</span>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="rounded border border-stone-300 bg-surface px-3 py-1.5 text-sm text-text-primary"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {ACCESSIBILITY_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => toggleAccessibility(chip)}
                className={`rounded-full px-3 py-1 text-xs ${
                  accessibility.includes(chip)
                    ? "bg-sage text-stone-800"
                    : "border border-stone-300 bg-surface text-text-secondary hover:bg-stone-100"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="rounded-md border border-stone-300 bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-stone-100"
            >
              📷 Scan show QR code
            </button>
          </div>
        </div>
      </section>

      {/* Event grid */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg bg-stone-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                passportId={event.passportId}
              />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-text-secondary">
            No events match your filters. Try adjusting them.
          </p>
        )}
      </section>

      {qrOpen && <QRScanner onClose={() => setQrOpen(false)} onScan={() => setQrOpen(false)} />}
    </div>
  );
}
