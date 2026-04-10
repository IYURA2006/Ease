import type { RouteConfidence } from "@/lib/routing/types";

interface ConfidenceBadgeProps {
  confidence: RouteConfidence;
}

const STYLES = {
  high: "bg-sage/20 text-stone-700 border-sage/40",
  medium: "bg-amber/10 text-amber-900 border-amber/40",
  low: "bg-dusty-rose/10 text-dusty-rose border-dusty-rose/40",
};

const LABELS = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <div>
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[confidence.level]}`}
      >
        {LABELS[confidence.level]}
      </span>
      {confidence.reasons.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {confidence.reasons.map((r, i) => (
            <li key={i} className="text-xs text-text-secondary">
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
