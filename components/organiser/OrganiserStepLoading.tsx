"use client";

import { useEffect, useState } from "react";
import type { SensoryFingerprint } from "@/lib/types";
import type { OrganiserFormData } from "../OrganiserDrawer";

const LOADING_MESSAGES = [
  "Reading your script...",
  "Identifying sensory moments...",
  "Mapping sound and lighting cues...",
  "Building your passport...",
];

interface OrganiserStepLoadingProps {
  formData: OrganiserFormData;
  onInferComplete: (fp: SensoryFingerprint, showTitle: string, venue: string) => void;
  onError: (message: string) => void;
}

export function OrganiserStepLoading({
  formData,
  onInferComplete,
  onError,
}: OrganiserStepLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let scriptText = "";
      let riderText = "";
      let scrapedText = "";

      try {
        if (formData.scriptFile) {
          const form = new FormData();
          form.append("file", formData.scriptFile);
          const res = await fetch("/api/parse-pdf", { method: "POST", body: form });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Failed to read script");
          }
          const data = await res.json();
          scriptText = data.text || "";
        }

        if (formData.riderFile) {
          const form = new FormData();
          form.append("file", formData.riderFile);
          const res = await fetch("/api/parse-pdf", { method: "POST", body: form });
          if (res.ok) {
            const data = await res.json();
            riderText = data.text || "";
          }
        }

        if (formData.listingUrl) {
          const res = await fetch("/api/scrape-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: formData.listingUrl }),
          });
          if (res.ok) {
            const data = await res.json();
            scrapedText = data.text || "";
          }
        }

        if (cancelled) return;

        const inferRes = await fetch("/api/infer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scriptText,
            riderText: riderText || undefined,
            scrapedText: scrapedText || undefined,
            showTitle: formData.showTitle,
            venue: formData.venue,
          }),
        });

        if (!inferRes.ok) {
          const data = await inferRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to generate passport");
        }

        const fingerprint = (await inferRes.json()) as SensoryFingerprint;
        if (!cancelled) onInferComplete(fingerprint, formData.showTitle, formData.venue);
      } catch (err) {
        if (!cancelled) onError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [formData, onInferComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal border-t-transparent" />
      <p className="text-center font-medium text-text-primary">
        {LOADING_MESSAGES[messageIndex]}
      </p>
    </div>
  );
}
