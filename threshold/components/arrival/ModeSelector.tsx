import type { RouteMode } from "@/lib/routing/types";

interface ModeSelectorProps {
  value: RouteMode;
  onChange: (mode: RouteMode) => void;
}

const MODES: { value: RouteMode; label: string; description: string }[] = [
  {
    value: "walking",
    label: "Walking",
    description: "Standard walking route",
  },
  {
    value: "wheelchair",
    label: "Wheelchair",
    description: "Step-free where mapped",
  },
  {
    value: "lower_stimulus",
    label: "Lower-stimulus",
    description: "Simpler path, fewer turns",
  },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div role="group" aria-label="Route mode">
      <p className="mb-2 text-sm font-medium text-text-primary">Route type</p>
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            aria-pressed={value === mode.value}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
              value === mode.value
                ? "border-teal bg-teal/10 text-teal ring-1 ring-teal"
                : "border-stone-300 bg-surface text-text-secondary hover:border-teal/50 hover:text-text-primary"
            }`}
          >
            <span className="block font-medium">{mode.label}</span>
            <span className="block text-xs opacity-75">{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
