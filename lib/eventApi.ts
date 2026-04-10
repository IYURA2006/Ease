// Teammate: add your API endpoint and key to .env.local and replace this stub

import type { Event } from "./types";
import { sampleEvents } from "./sampleEvents";

export async function fetchEvents(/* filters?: EventFilters */): Promise<Event[]> {
  // If EVENT_API_KEY and VENUE_API_URL are set, call real API here
  if (process.env.EVENT_API_KEY && process.env.VENUE_API_URL) {
    try {
      const res = await fetch(
        `${process.env.VENUE_API_URL}/events`,
        {
          headers: { Authorization: `Bearer ${process.env.EVENT_API_KEY}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data.events ?? [];
      }
    } catch {
      // fall through to sample data
    }
  }
  return sampleEvents;
}

export async function fetchVenueDetails(venueId: string): Promise<{ id: string; name: string; [key: string]: unknown } | null> {
  if (process.env.EVENT_API_KEY && process.env.VENUE_API_URL) {
    try {
      const res = await fetch(
        `${process.env.VENUE_API_URL}/venues/${venueId}`,
        {
          headers: { Authorization: `Bearer ${process.env.EVENT_API_KEY}` },
        }
      );
      if (res.ok) return res.json();
    } catch {
      // fall through
    }
  }
  return null;
}

export async function fetchEventById(eventId: string): Promise<Event | null> {
  if (process.env.EVENT_API_KEY && process.env.VENUE_API_URL) {
    try {
      const res = await fetch(
        `${process.env.VENUE_API_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${process.env.EVENT_API_KEY}` },
        }
      );
      if (res.ok) return res.json();
    } catch {
      // fall through
    }
  }
  return sampleEvents.find((e) => e.id === eventId) ?? null;
}
