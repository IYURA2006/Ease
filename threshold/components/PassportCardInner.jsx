"use client";

import {
  Volume2,
  Sun,
  Hand,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";
import { PassportCardRoot } from "./PassportCardRoot";
import { PassportDimensionRow } from "./PassportDimensionRow";

const DIMENSIONS = [
  { dimKey: "sound", icon: Volume2, label: "Sound" },
  { dimKey: "light", icon: Sun, label: "Light" },
  { dimKey: "touch", icon: Hand, label: "Touch" },
  { dimKey: "content", icon: AlertTriangle, label: "Content" },
  { dimKey: "space", icon: Users, label: "Space" },
  { dimKey: "intervalAndTiming", icon: Clock, label: "Interval & Timing" },
];

export function PassportCardInner({ record, qrCode = null, showActions = true }) {
  const { fingerprint, showTitle, venue, duration, date, id, createdAt } = record;

  return (
    <PassportCardRoot
      className="passport-card paper-texture rounded-lg border border-stone-300 bg-[#FAF8F5] p-6 shadow-md print:shadow-none"
    >
      <div className="border-b border-stone-300 pb-4">
        <h1 className="font-playfair text-3xl font-semibold text-text-primary">
          {showTitle}
        </h1>
        <p className="mt-1 text-text-secondary">{venue}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-text-secondary">
          {duration && <span>{duration}</span>}
          {date && <span>{date}</span>}
        </div>
        <span className="mt-2 inline-block rounded-full bg-stone-200 px-2 py-0.5 text-xs text-text-secondary">
          {fingerprint.confidenceSource}
        </span>
      </div>

      <div className="space-y-3 border-b border-stone-300 py-4">
        {DIMENSIONS.map(({ dimKey, icon: Icon, label }) => {
          const dim = fingerprint[dimKey];
          if (typeof dim !== "object" || !("level" in dim)) return null;
          return (
            <PassportDimensionRow
              key={dimKey}
              label={label}
              dim={dim}
              icon={Icon}
            />
          );
        })}
      </div>

      <div className="border-b border-stone-300 py-4">
        <div className="rounded bg-sage/15 p-3">
          <p className="text-sm font-medium text-text-primary">Exit & interval</p>
          <p className="mt-1 text-sm text-text-secondary">{fingerprint.exitInfo}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {fingerprint.intervalDetails}
          </p>
        </div>
      </div>

      {fingerprint.aiNotes && (
        <div className="border-b border-stone-300 py-4">
          <p className="text-sm font-medium text-text-primary">AI notes</p>
          <p className="mt-1 text-sm text-text-secondary">{fingerprint.aiNotes}</p>
        </div>
      )}

      {fingerprint.accessibilityFeatures?.length ? (
        <div className="flex flex-wrap gap-1.5 border-b border-stone-300 py-4">
          {fingerprint.accessibilityFeatures.map((f) => (
            <span
              key={f}
              className="rounded bg-sage/20 px-2 py-0.5 text-xs text-stone-700"
            >
              {f}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-4">
        <span className="font-playfair text-sm font-semibold text-text-primary">
          THRESHOLD
        </span>
        <div className="text-right text-xs text-text-secondary">
          <p>ID: {id.slice(0, 8)}…</p>
          <p>{new Date(createdAt).toLocaleDateString()}</p>
        </div>
        {qrCode && (
          <img src={qrCode} alt="Passport QR code" width={64} height={64} />
        )}
      </div>

      {showActions && (
        <div className="mt-6 flex flex-wrap gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-stone-300 bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-stone-100"
          >
            Download as PDF
          </button>
          <button
            type="button"
            onClick={() => {
              const url = typeof window !== "undefined" ? window.location.href : "";
              navigator.clipboard.writeText(url);
            }}
            className="rounded border border-stone-300 bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-stone-100"
          >
            Copy link
          </button>
          <a
            href={`/captions?passport=${id}`}
            className="rounded bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal/90"
          >
            Open in Captions mode
          </a>
          <a
            href={`/route?venue=${encodeURIComponent(venue)}`}
            className="rounded bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal/90"
          >
            Get safe route
          </a>
        </div>
      )}
    </PassportCardRoot>
  );
}
