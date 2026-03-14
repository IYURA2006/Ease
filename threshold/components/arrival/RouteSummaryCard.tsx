"use client";

import { useState } from "react";
import type { PlannedRouteResult } from "@/lib/routing/types";
import { AccessibilityNotesList } from "./AccessibilityNotesList";
import { WarningList } from "./WarningList";
import { RouteInstructionsList } from "./RouteInstructionsList";

interface RouteSummaryCardProps {
  result: PlannedRouteResult;
}

const MODE_LABELS: Record<string, string> = {
  walking: "Walking",
  wheelchair: "Wheelchair",
  lower_stimulus: "Lower-stimulus",
};

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function truncateLabel(label: string, maxLen = 60): string {
  return label.length > maxLen ? label.slice(0, maxLen) + "…" : label;
}

export function RouteSummaryCard({ result }: RouteSummaryCardProps) {
  const [stepsOpen, setStepsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-stone-200 bg-surface shadow-sm">
      {/* Header */}
      <div className="border-b border-stone-100 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Route found
        </p>
        <p className="mt-0.5 text-sm text-text-secondary">
          {truncateLabel(result.destination.label)}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 divide-x divide-stone-100 border-b border-stone-100">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-teal">{result.summary.durationMinutes}</p>
          <p className="text-xs text-text-secondary">min</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-teal">
            {formatDistance(result.summary.distanceMeters)}
          </p>
          <p className="text-xs text-text-secondary">distance</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm font-medium text-teal">
            {MODE_LABELS[result.mode] ?? result.mode}
          </p>
          <p className="text-xs text-text-secondary">mode</p>
        </div>
      </div>

      {/* Accessibility notes */}
      {result.accessibilityNotes.length > 0 && (
        <div className="border-b border-stone-100 p-5">
          <AccessibilityNotesList notes={result.accessibilityNotes} />
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="border-b border-stone-100 p-5">
          <WarningList warnings={result.warnings} />
        </div>
      )}

      {/* Public transport */}
      {result.transportNotes.length > 0 && (
        <div className="border-b border-stone-100 p-5">
          <h3 className="text-sm font-semibold text-text-primary">Public transport nearby</h3>
          <ul className="mt-2 space-y-1.5" role="list">
            {result.transportNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                <span className="mt-0.5 flex-shrink-0 text-text-secondary" aria-hidden>
                  🚌
                </span>
                {note}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="https://www.travelinescotland.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-stone-200 px-2.5 py-1 text-xs text-text-secondary hover:border-teal hover:text-teal"
            >
              Traveline Scotland
            </a>
            <a
              href="https://lothianbuses.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-stone-200 px-2.5 py-1 text-xs text-text-secondary hover:border-teal hover:text-teal"
            >
              Lothian Buses
            </a>
            <a
              href="https://www.scotrail.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-stone-200 px-2.5 py-1 text-xs text-text-secondary hover:border-teal hover:text-teal"
            >
              ScotRail
            </a>
          </div>
        </div>
      )}

      {/* Collapsible step-by-step directions */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => setStepsOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-text-primary transition hover:bg-stone-50"
          aria-expanded={stepsOpen}
        >
          <span>{stepsOpen ? "Hide steps" : "Show steps"}</span>
          <span
            className={`text-text-secondary transition-transform duration-200 ${stepsOpen ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {stepsOpen && (
          <div className="mt-3">
            <RouteInstructionsList instructions={result.instructions} />
          </div>
        )}
      </div>
    </div>
  );
}
