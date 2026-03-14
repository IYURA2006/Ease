"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const MIN_FONT_SIZE = 24;
const MAX_FONT_SIZE = 48;
const DEFAULT_FONT_SIZE = 32;

export default function CaptionsPage() {
  const searchParams = useSearchParams();
  const passportId = searchParams.get("passport");
  const [captions, setCaptions] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [highContrast, setHighContrast] = useState(false);
  const [scriptContext, setScriptContext] = useState<string | null>(null);
  const [scriptLoading, setScriptLoading] = useState(!!passportId);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load script context from passport if ?passport= is present
  useEffect(() => {
    if (!passportId) {
      setScriptLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/passport/${passportId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled || !data) return;
        setScriptContext(
          data.fingerprint?.aiNotes
            ? `Show: ${data.showTitle}\n${data.fingerprint.aiNotes}`
            : `Show: ${data.showTitle} — No script context for this passport.`
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setScriptLoading(false);
      });
    return () => { cancelled = true; };
  }, [passportId]);

  const addCaption = useCallback((text: string) => {
    if (!text.trim()) return;
    setCaptions((prev) => {
      const next = [...prev, text];
      return next.slice(-12);
    });
  }, []);

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      if (event.results[last].isFinal && transcript) {
        addCaption(transcript);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", e.error);
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [addCaption]);

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      rec.start();
      setListening(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-captions-bg">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Live captions — dominant */}
        <div
          className={`flex flex-1 flex-col ${highContrast ? "bg-black text-white" : "bg-captions-bg text-captions-text"}`}
          ref={containerRef}
        >
          <div className="flex flex-1 flex-col justify-end p-6">
            <div className="space-y-2">
              {captions.slice(-4).map((line, i) => (
                <p
                  key={i}
                  className="leading-relaxed transition-opacity"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 p-4">
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium ${
                listening
                  ? "bg-dusty-rose text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              aria-label={listening ? "Turn microphone off" : "Turn microphone on"}
            >
              {listening && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              )}
              {listening ? "Listening" : "Start listening"}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.max(MIN_FONT_SIZE, s - 4))}
                className="rounded bg-white/20 px-2 py-1 text-white hover:bg-white/30"
                aria-label="Decrease text size"
              >
                A-
              </button>
              <span className="text-sm text-white/80" style={{ minWidth: 40 }}>
                {fontSize}px
              </span>
              <button
                type="button"
                onClick={() => setFontSize((s) => Math.min(MAX_FONT_SIZE, s + 4))}
                className="rounded bg-white/20 px-2 py-1 text-white hover:bg-white/30"
                aria-label="Increase text size"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setHighContrast((c) => !c)}
                className="rounded bg-white/20 px-3 py-1 text-sm text-white hover:bg-white/30"
              >
                {highContrast ? "High contrast on" : "High contrast"}
              </button>
            </div>
          </div>
        </div>

        {/* Script / context panel */}
        <div className="w-full border-t border-white/20 lg:w-96 lg:border-l lg:border-t-0">
          <div className="flex h-full flex-col p-4">
            <h2 className="text-sm font-medium text-white/90">Script context</h2>
            {scriptLoading ? (
              <p className="mt-2 text-white/70">Loading…</p>
            ) : scriptContext ? (
              <pre className="mt-2 flex-1 overflow-auto whitespace-pre-wrap text-sm text-white/80">
                {scriptContext}
              </pre>
            ) : (
              <p className="mt-2 text-white/70">
                Open a passport and click &quot;Open in Captions mode&quot; to see script
                context here, or use microphone-only mode.
              </p>
            )}
          </div>
        </div>
      </div>

      {typeof window !== "undefined" &&
        !(window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition &&
        !(window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition && (
          <div className="border-t border-dusty-rose/50 bg-dusty-rose/20 p-4 text-center text-white">
            Speech recognition is not supported in this browser. Try Chrome or Edge.
          </div>
        )}
    </div>
  );
}
