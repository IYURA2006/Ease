// Sensory level used across the platform
export type SensoryLevel = "low" | "medium" | "high" | "extreme";

// Single sensory dimension in the passport
export interface SensoryDimension {
  level: SensoryLevel;
  summary: string;
  flaggedMoments?: FlaggedMoment[];
}

// A specific moment in the show (e.g. "Unannounced gunshot — approx 35 min")
export interface FlaggedMoment {
  description: string;
  approximateTime?: string; // e.g. "35 min", "Act 2", "LX cue 14"
}

// Full sensory fingerprint — what Claude infers and we store
export interface SensoryFingerprint {
  sound: SensoryDimension;
  light: SensoryDimension;
  touch: SensoryDimension;
  content: SensoryDimension;
  space: SensoryDimension;
  intervalAndTiming: SensoryDimension;
  exitInfo: string;
  intervalDetails: string;
  confidence: "high" | "medium" | "low";
  confidenceSource: string; // e.g. "Inferred from script + tech rider"
  aiNotes?: string;
  accessibilityFeatures?: string[]; // BSL interpreted, relaxed performance, etc.
}

// Stored passport = fingerprint + metadata
export interface PassportRecord {
  id: string;
  fingerprint: SensoryFingerprint;
  showTitle: string;
  venue: string;
  duration?: string;
  date?: string;
  eventType?: string;
  createdAt: string; // ISO
}

// Event as shown on Discover (may come from API or sample data)
export interface Event {
  id: string;
  title: string;
  venue: string;
  venueId?: string;
  date: string;
  duration?: string;
  eventType: "theatre" | "music" | "exhibition" | "comedy" | "dance" | "other";
  fingerprint: SensoryFingerprint;
  passportId?: string; // if we have a stored passport
}

// Filters for Discover page
export interface EventFilters {
  sensoryLevel?: "all" | "low" | "low_medium";
  eventType?: string;
  accessibility?: string[];
}

// Match API request/response
export interface MatchRequest {
  needs: string;
  fingerprint: SensoryFingerprint;
}

export type MatchVerdict = "suitable" | "suitable_with_preparation" | "not_recommended";

export interface MatchResult {
  verdict: MatchVerdict;
  explanation: string;
  flags: string[];
  suggestions: string[];
  reassurances: string[];
}

// Organiser upload flow
export interface InferRequest {
  scriptText: string;
  riderText?: string;
  scrapedText?: string;
  showTitle: string;
  venue: string;
}

export interface CreatePassportRequest {
  fingerprint: SensoryFingerprint;
  showTitle: string;
  venue: string;
  duration?: string;
  date?: string;
  eventType?: string;
}
