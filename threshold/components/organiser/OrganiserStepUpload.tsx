"use client";

import { useState } from "react";
import type { OrganiserFormData } from "../OrganiserDrawer";

interface OrganiserStepUploadProps {
  error: string;
  onStartLoading: (data: OrganiserFormData) => void;
}

export function OrganiserStepUpload({ error, onStartLoading }: OrganiserStepUploadProps) {
  const [showTitle, setShowTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("theatre");
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [riderFile, setRiderFile] = useState<File | null>(null);
  const [listingUrl, setListingUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTitle.trim() || !venue.trim()) return;
    if (!scriptFile && !listingUrl.trim()) return;

    onStartLoading({
      showTitle: showTitle.trim(),
      venue: venue.trim(),
      eventDate,
      eventType,
      scriptFile,
      riderFile,
      listingUrl: listingUrl.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      {error && (
        <div className="rounded-md bg-dusty-rose/20 px-3 py-2 text-sm text-rose-800">
          {error}
        </div>
      )}

      <label className="block text-sm font-medium text-text-primary">
        Show Title <span className="text-deep-red">*</span>
      </label>
      <input
        type="text"
        value={showTitle}
        onChange={(e) => setShowTitle(e.target.value)}
        className="w-full rounded border border-stone-300 px-3 py-2 text-text-primary"
        required
      />

      <label className="block text-sm font-medium text-text-primary">
        Venue Name <span className="text-deep-red">*</span>
      </label>
      <input
        type="text"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        className="w-full rounded border border-stone-300 px-3 py-2 text-text-primary"
        required
      />

      <label className="block text-sm font-medium text-text-primary">Event Date</label>
      <input
        type="text"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
        placeholder="e.g. 2025-04-12"
        className="w-full rounded border border-stone-300 px-3 py-2 text-text-primary"
      />

      <label className="block text-sm font-medium text-text-primary">Event Type</label>
      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        className="w-full rounded border border-stone-300 px-3 py-2 text-text-primary"
      >
        <option value="theatre">Theatre</option>
        <option value="music">Music</option>
        <option value="exhibition">Exhibition</option>
        <option value="comedy">Comedy</option>
        <option value="dance">Dance</option>
        <option value="other">Other</option>
      </select>

      <label className="block text-sm font-medium text-text-primary">
        Script <span className="text-deep-red">*</span> (PDF, .txt)
      </label>
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={(e) => setScriptFile(e.target.files?.[0] ?? null)}
        className="w-full text-sm text-text-secondary"
      />

      <label className="block text-sm font-medium text-text-primary">
        Tech rider (optional, PDF, .txt)
      </label>
      <input
        type="file"
        accept=".pdf,.txt"
        onChange={(e) => setRiderFile(e.target.files?.[0] ?? null)}
        className="w-full text-sm text-text-secondary"
      />

      <label className="block text-sm font-medium text-text-primary">
        Event listing URL (optional)
      </label>
      <input
        type="url"
        value={listingUrl}
        onChange={(e) => setListingUrl(e.target.value)}
        placeholder="https://..."
        className="w-full rounded border border-stone-300 px-3 py-2 text-text-primary"
      />

      <button
        type="submit"
        className="mt-4 rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-50"
        disabled={(!scriptFile && !listingUrl.trim()) || !showTitle.trim() || !venue.trim()}
      >
        Generate Passport
      </button>
    </form>
  );
}
