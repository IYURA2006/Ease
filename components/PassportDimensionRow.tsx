"use client";

import type { SensoryDimension } from "@/lib/types";
import { SensoryLevelBadge } from "./SensoryLevelBadge";

interface PassportDimensionRowProps {
  label: string;
  dim: SensoryDimension;
  icon: React.ComponentType<{ className?: string }>;
}

export function PassportDimensionRow({ label, dim, icon: Icon }: PassportDimensionRowProps) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-text-secondary" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-text-primary">{label}</span>
            <SensoryLevelBadge level={dim.level} size="md" />
          </div>
          <p className="mt-0.5 text-sm text-text-secondary">{dim.summary}</p>
          {dim.flaggedMoments?.map((m, i) => (
            <div
              key={i}
              className="mt-1 rounded bg-amber/10 px-2 py-1 text-xs text-amber-900"
            >
              {m.description}
              {m.approximateTime && ` — ${m.approximateTime}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
