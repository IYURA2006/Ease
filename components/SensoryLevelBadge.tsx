import type { SensoryLevel } from "@/lib/types";

const levelStyles: Record<
  SensoryLevel,
  { bg: string; text: string; label: string }
> = {
  low: { bg: "bg-sage", text: "text-stone-800", label: "LOW" },
  medium: { bg: "bg-amber", text: "text-amber-900", label: "MEDIUM" },
  high: { bg: "bg-dusty-rose", text: "text-rose-900", label: "HIGH" },
  extreme: { bg: "bg-deep-red", text: "text-white", label: "EXTREME" },
};

interface SensoryLevelBadgeProps {
  level: SensoryLevel;
  size?: "sm" | "md";
}

export function SensoryLevelBadge({ level, size = "sm" }: SensoryLevelBadgeProps) {
  const { bg, text, label } = levelStyles[level];
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${bg} ${text} ${
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
