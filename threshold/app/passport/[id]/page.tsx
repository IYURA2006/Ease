"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PassportCard } from "@/components/PassportCard";
import { MatchResultDisplay } from "@/components/MatchResultDisplay";
import type { PassportRecord, SensoryFingerprint, MatchResult as MatchResultType } from "@/lib/types";
import { sampleEvents } from "@/lib/sampleEvents";

function buildSampleRecord(sampleId: string): PassportRecord | null {
  const event = sampleEvents.find((e) => e.id === sampleId);
  if (!event) return null;
  return {
    id: event.id,
    showTitle: event.title,
    venue: event.venue,
    date: event.date,
    duration: event.duration,
    eventType: event.eventType,
    fingerprint: event.fingerprint,
    createdAt: new Date().toISOString(),
  };
}

export default function PassportPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [record, setRecord] = useState<PassportRecord | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needs, setNeeds] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResultType | null>(null);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    if (!id) return;

    if (id.startsWith("sample-")) {
      const sample = buildSampleRecord(id);
      setRecord(sample);
      setQrCode(null);
      setLoading(false);
      setError(sample ? "" : "Passport not found");
      return;
    }

    let cancelled = false;
    fetch(`/api/passport/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setRecord({
            id: data.id,
            fingerprint: data.fingerprint,
            showTitle: data.showTitle,
            venue: data.venue,
            duration: data.duration,
            date: data.date,
            eventType: data.eventType,
            createdAt: data.createdAt,
          });
          setQrCode(data.qrCode ?? null);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("This passport could not be found.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleMatch = async () => {
    if (!record?.fingerprint || !needs.trim()) return;
    setMatching(true);
    setMatchResult(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needs: needs.trim(), fingerprint: record.fingerprint }),
      });
      if (!res.ok) throw new Error("Match failed");
      const data = await res.json();
      setMatchResult(data);
    } catch {
      setMatchResult({
        verdict: "not_recommended",
        explanation: "We couldn’t complete the check. Please try again.",
        flags: [],
        suggestions: [],
        reassurances: [],
      });
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-dusty-rose">{error || "Passport not found."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PassportCard record={record} qrCode={qrCode} showActions={true} />

      <section className="mt-12 border-t border-stone-200 pt-12">
        <h2 className="font-playfair text-2xl font-semibold text-text-primary">
          Is this show right for you?
        </h2>
        <p className="mt-2 text-text-secondary">
          Tell us about your sensory needs and we&apos;ll give you an honest answer.
        </p>
        <textarea
          value={needs}
          onChange={(e) => setNeeds(e.target.value)}
          placeholder="e.g. I'm autistic and sudden loud noises are very difficult, or I have PTSD and need to avoid content about violence, or I use a wheelchair and need to know about seating"
          className="mt-4 w-full rounded-lg border border-stone-300 bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary min-h-[120px]"
          rows={4}
        />
        <button
          type="button"
          onClick={handleMatch}
          disabled={matching || !needs.trim()}
          className="mt-4 rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-50"
        >
          {matching ? "Checking…" : "Check this show for me"}
        </button>

        {matchResult && (
          <MatchResultDisplay result={matchResult} className="mt-8" />
        )}
      </section>
    </div>
  );
}
