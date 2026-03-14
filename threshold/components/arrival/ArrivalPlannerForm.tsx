import type { RouteMode } from "@/lib/routing/types";
import { ModeSelector } from "./ModeSelector";

interface ArrivalPlannerFormProps {
  start: string;
  setStart: (v: string) => void;
  destination: string;
  setDestination: (v: string) => void;
  mode: RouteMode;
  setMode: (m: RouteMode) => void;
  onSubmit: () => void;
  loading: boolean;
  prefillVenueLabel?: string;
  onPrefillVenue?: () => void;
}

export function ArrivalPlannerForm({
  start,
  setStart,
  destination,
  setDestination,
  mode,
  setMode,
  onSubmit,
  loading,
  prefillVenueLabel,
  onPrefillVenue,
}: ArrivalPlannerFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="rounded-md bg-teal/5 px-3 py-2 text-xs text-teal">
        Edinburgh locations only
      </p>
      <div>
        <label htmlFor="arrival-start" className="block text-sm font-medium text-text-primary">
          Where are you starting from?
        </label>
        <input
          id="arrival-start"
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="e.g. Edinburgh Waverley Station"
          required
          disabled={loading}
          className="mt-1.5 w-full rounded-lg border border-stone-300 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal disabled:opacity-50"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="arrival-dest" className="block text-sm font-medium text-text-primary">
            Venue / destination
          </label>
          {prefillVenueLabel && onPrefillVenue && (
            <button
              type="button"
              onClick={onPrefillVenue}
              className="text-xs text-teal underline hover:text-teal/80"
            >
              Use: {prefillVenueLabel}
            </button>
          )}
        </div>
        <input
          id="arrival-dest"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Traverse Theatre, Edinburgh"
          required
          disabled={loading}
          className="mt-1.5 w-full rounded-lg border border-stone-300 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal disabled:opacity-50"
        />
      </div>

      <ModeSelector value={mode} onChange={setMode} />

      <button
        type="submit"
        disabled={loading || !start.trim() || !destination.trim()}
        className="w-full rounded-lg bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Planning route…
          </span>
        ) : (
          "Plan accessible arrival route"
        )}
      </button>
    </form>
  );
}
