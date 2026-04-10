import Link from "next/link";
import {
  Volume2,
  Sun,
  Hand,
  AlertTriangle,
  Users,
} from "lucide-react";
import type { Event as EventType } from "@/lib/types";
import { SensoryLevelBadge } from "./SensoryLevelBadge";

const DIMENSIONS = [
  { key: "sound" as const, icon: Volume2, label: "Sound" },
  { key: "light" as const, icon: Sun, label: "Light" },
  { key: "touch" as const, icon: Hand, label: "Touch" },
  { key: "content" as const, icon: AlertTriangle, label: "Content" },
  { key: "space" as const, icon: Users, label: "Space" },
];

interface EventCardProps {
  event: EventType;
  passportId?: string;
}

export function EventCard({ event, passportId }: EventCardProps) {
  const href = passportId ? `/passport/${passportId}` : `/passport/${event.id}`;
  const fingerprint = event.fingerprint;

  return (
    <article
      className="flex flex-col rounded-lg border border-stone-200 bg-surface p-5 shadow-sm transition hover:shadow-md"
      aria-labelledby={`event-title-${event.id}`}
    >
      <h2
        id={`event-title-${event.id}`}
        className="font-playfair text-xl font-semibold text-text-primary"
      >
        {event.title}
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        {event.venue} · {formatDate(event.date)}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5" role="list" aria-label="Sensory levels">
        {DIMENSIONS.map(({ key, icon: Icon }) => (
          <span
            key={key}
            className="flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-text-secondary"
            role="listitem"
          >
            <Icon className="h-3 w-3" aria-hidden />
            <SensoryLevelBadge level={fingerprint[key]?.level} />
          </span>
        ))}
      </div>

      {fingerprint.accessibilityFeatures && fingerprint.accessibilityFeatures.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {fingerprint.accessibilityFeatures.slice(0, 3).map((f) => (
            <span
              key={f}
              className="rounded bg-sage/20 px-1.5 py-0.5 text-[10px] text-stone-700"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <Link
        href={href}
        className="mt-4 inline-flex w-fit items-center justify-center rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
      >
        View Passport
      </Link>
    </article>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
