import type { RouteInstruction } from "@/lib/routing/types";

interface RouteInstructionsListProps {
  instructions: RouteInstruction[];
}

function formatDistance(meters: number | null): string | null {
  if (meters === null) return null;
  if (meters < 10) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function RouteInstructionsList({ instructions }: RouteInstructionsListProps) {
  if (instructions.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary">Step-by-step directions</h3>
      <ol className="mt-2 space-y-2" role="list">
        {instructions.map((step, i) => {
          const dist = formatDistance(step.distanceMeters);
          return (
            <li
              key={i}
              className="flex items-start gap-3 rounded-md bg-stone-50 px-3 py-2.5 text-sm"
            >
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal/10 text-xs font-semibold text-teal"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="flex-1 text-text-primary">{step.text}</span>
              {dist && (
                <span className="flex-shrink-0 text-xs text-text-secondary">{dist}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
