"use client";

import type { MatchResult as MatchResultType } from "@/lib/types";

const VERDICT_STYLES = {
  suitable: "text-sage text-5xl font-semibold",
  suitable_with_preparation: "text-amber text-5xl font-semibold",
  not_recommended: "text-dusty-rose text-5xl font-semibold",
};

const VERDICT_LABELS = {
  suitable: "SUITABLE",
  suitable_with_preparation: "WITH PREPARATION",
  not_recommended: "NOT RECOMMENDED",
};

interface MatchResultDisplayProps {
  result: MatchResultType;
  className?: string;
}

export function MatchResultDisplay({ result, className = "" }: MatchResultDisplayProps) {
  const verdictClass = VERDICT_STYLES[result.verdict];
  const verdictLabel = VERDICT_LABELS[result.verdict];

  return (
    <div
      className={`rounded-lg border border-stone-200 bg-surface p-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <p className={verdictClass}>{verdictLabel}</p>
      <p className="mt-4 text-text-primary">{result.explanation}</p>

      {result.flags.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-text-primary">Things to know</h3>
          <ul className="mt-1 list-inside list-disc text-sm text-text-secondary">
            {result.flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-text-primary">Our suggestions</h3>
          <ul className="mt-1 list-inside list-disc text-sm text-text-secondary">
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {result.reassurances.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-text-primary">What&apos;s fine for you</h3>
          <ul className="mt-1 list-inside list-disc text-sm text-sage">
            {result.reassurances.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
