// JSON schema description for Claude — must match SensoryFingerprint exactly
export const SENSORY_FINGERPRINT_SCHEMA = `
SensoryFingerprint is a JSON object with exactly these keys (all required except aiNotes and accessibilityFeatures):
{
  "sound": { "level": "low"|"medium"|"high"|"extreme", "summary": string, "flaggedMoments"?: [{ "description": string, "approximateTime"?: string }] },
  "light": { "level": "low"|"medium"|"high"|"extreme", "summary": string, "flaggedMoments"?: [{ "description": string, "approximateTime"?: string }] },
  "touch": { "level": "low"|"medium"|"high"|"extreme", "summary": string, "flaggedMoments"?: [{ "description": string, "approximateTime"?: string }] },
  "content": { "level": "low"|"medium"|"high"|"extreme", "summary": string, "flaggedMoments"?: [{ "description": string, "approximateTime"?: string }] },
  "space": { "level": "low"|"medium"|"high"|"extreme", "summary": string, "flaggedMoments"?: [{ "description": string, "approximateTime"?: string }] },
  "intervalAndTiming": { "level": "low"|"medium"|"high"|"extreme", "summary": string, "flaggedMoments"?: [{ "description": string, "approximateTime"?: string }] },
  "exitInfo": string,
  "intervalDetails": string,
  "confidence": "high"|"medium"|"low",
  "confidenceSource": string,
  "aiNotes"?: string,
  "accessibilityFeatures"?: string[]
}
`;
