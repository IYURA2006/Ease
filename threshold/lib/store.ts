import type { PassportRecord } from "./types";

// In-memory store for hackathon — no database.
// Key: passport id (UUID), Value: PassportRecord
//
// Attached to globalThis so the same Map instance is reused across
// Next.js hot-reloads in development (each route module reimports this
// file, but globalThis persists for the lifetime of the Node process).
declare global {
  // eslint-disable-next-line no-var
  var __passportStore: Map<string, PassportRecord> | undefined;
}

const passportStore: Map<string, PassportRecord> =
  globalThis.__passportStore ?? new Map<string, PassportRecord>();

globalThis.__passportStore = passportStore;

export function getPassport(id: string): PassportRecord | undefined {
  return passportStore.get(id);
}

export function setPassport(record: PassportRecord): void {
  passportStore.set(record.id, record);
}

export function hasPassport(id: string): boolean {
  return passportStore.has(id);
}

export function getAllPassports(): PassportRecord[] {
  return Array.from(passportStore.values());
}
