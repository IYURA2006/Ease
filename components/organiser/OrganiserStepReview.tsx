"use client";

import { useState } from "react";
import type { SensoryFingerprint } from "@/lib/types";
import { SensoryLevelBadge } from "../SensoryLevelBadge";
import { Volume2, Sun, Hand, AlertTriangle, Users, Clock } from "lucide-react";

const DIMENSIONS: { key: keyof SensoryFingerprint; icon: typeof Volume2; label: string }[] = [
  { key: "sound", icon: Volume2, label: "Sound" },
  { key: "light", icon: Sun, label: "Light" },
  { key: "touch", icon: Hand, label: "Touch" },
  { key: "content", icon: AlertTriangle, label: "Content" },
  { key: "space", icon: Users, label: "Space" },
  { key: "intervalAndTiming", icon: Clock, label: "Interval & Timing" },
];

interface OrganiserStepReviewProps {
  fingerprint: SensoryFingerprint;
  showTitle: string;
  venue: string;
  onBack: () => void;
  onCreateComplete: (id: string, url: string, qrCode: string) => void;
}

export function OrganiserStepReview({
  fingerprint,
  showTitle,
  venue,
  onBack,
  onCreateComplete,
}: OrganiserStepReviewProps) {
  const [strobe, setStrobe] = useState(!!fingerprint.light.flaggedMoments?.length);
  const [contact, setContact] = useState(fingerprint.touch.level !== "low");
  const [contentNotes, setContentNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/passport/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint, showTitle, venue }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create passport");
      }
      const data = await res.json();
      onCreateComplete(data.id, data.url, data.qrCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-sm text-text-secondary">
        Review the sensory profile below. Confirm the three points and create your passport.
      </p>

      <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
        {DIMENSIONS.map(({ key, icon: Icon, label }) => {
          const dim = fingerprint[key];
          if (typeof dim !== "object" || !("level" in dim)) return null;
          return (
            <div key={key} className="flex items-center gap-2 border-b border-stone-200 py-2 last:border-0">
              <Icon className="h-4 w-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-primary">{label}</span>
              <SensoryLevelBadge level={dim.level} size="md" />
              <span className="text-xs text-text-secondary">{dim.summary}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-stone-200 pt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={strobe}
            onChange={(e) => setStrobe(e.target.checked)}
            className="rounded border-stone-300"
          />
          <span className="text-sm text-text-primary">
            Does your show contain strobe or flickering lighting?
          </span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={contact}
            onChange={(e) => setContact(e.target.checked)}
            className="rounded border-stone-300"
          />
          <span className="text-sm text-text-primary">
            Is there direct audience contact or immersive staging?
          </span>
        </label>
        <label className="block">
          <span className="text-sm text-text-primary">
            Content themes Claude may have missed?
          </span>
          <textarea
            value={contentNotes}
            onChange={(e) => setContentNotes(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2 text-sm"
            rows={2}
          />
        </label>
      </div>

      {error && (
        <div className="rounded bg-dusty-rose/20 px-3 py-2 text-sm text-rose-800">{error}</div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-stone-300 px-4 py-2 text-sm font-medium text-text-primary hover:bg-stone-100"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="rounded bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Passport"}
        </button>
      </div>
    </div>
  );
}
