import type { PassportRecord } from "./types";

// In-memory store for hackathon — no database.
// Key: passport id (UUID), Value: PassportRecord
const passportStore = new Map<string, PassportRecord>();

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
