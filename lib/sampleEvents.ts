import type { Event } from "./types";
import type { SensoryFingerprint } from "./types";

const crossingFingerprint: SensoryFingerprint = {
  sound: {
    level: "extreme",
    summary: "One unannounced loud sound (gunshot) in the second half. Otherwise moderate dialogue and ambient sound.",
    flaggedMoments: [
      { description: "Unannounced gunshot", approximateTime: "approx 35 min" },
    ],
  },
  light: {
    level: "high",
    summary: "Strobe lighting used at two points. Otherwise low to medium lighting.",
    flaggedMoments: [
      { description: "Strobe lighting", approximateTime: "approx 20 min" },
      { description: "Strobe lighting", approximateTime: "approx 55 min" },
    ],
  },
  touch: {
    level: "low",
    summary: "No direct audience contact or immersive touch elements.",
  },
  content: {
    level: "high",
    summary: "Themes of grief, loss, and immigration. Emotional intensity throughout.",
    flaggedMoments: [
      { description: "Discussion of death and bereavement" },
      { description: "References to border violence" },
    ],
  },
  space: {
    level: "medium",
    summary: "Small studio space, 60 seats. Intimate and contained. Easy exit to foyer.",
  },
  intervalAndTiming: {
    level: "low",
    summary: "No interval. Running time approximately 70 minutes.",
  },
  exitInfo: "Single exit to foyer. No steps. Accessible toilet nearby.",
  intervalDetails: "No interval.",
  confidence: "high",
  confidenceSource: "Inferred from script + tech rider",
  aiNotes: "This production contains one sudden, unannounced loud sound that may be distressing. Strobe is cued at specific moments.",
  accessibilityFeatures: ["Relaxed performance available (select dates)"],
};

const stillLifeFingerprint: SensoryFingerprint = {
  sound: {
    level: "low",
    summary: "Quiet gallery environment. No sudden or loud sounds.",
  },
  light: {
    level: "low",
    summary: "Controlled gallery lighting. No strobes or sudden changes.",
  },
  touch: {
    level: "low",
    summary: "No touch elements. Viewing only.",
  },
  content: {
    level: "low",
    summary: "Themes of solitude and nature. Calm, contemplative work.",
  },
  space: {
    level: "low",
    summary: "Spacious gallery, sparse crowd. Very easy to move and exit.",
  },
  intervalAndTiming: {
    level: "low",
    summary: "Open viewing. No fixed duration. Come and go as you like.",
  },
  exitInfo: "Step-free access throughout. Multiple exits. Quiet corridor to street.",
  intervalDetails: "N/A — open viewing.",
  confidence: "high",
  confidenceSource: "Inferred from event listing + venue information",
  aiNotes: "Suitable for low-sensory needs. Step-free access confirmed.",
  accessibilityFeatures: ["Step-free access", "No strobes", "No sudden sounds"],
};

const northernSoulFingerprint: SensoryFingerprint = {
  sound: {
    level: "high",
    summary: "Sustained high volume typical of live music. No sudden spikes beyond normal concert levels.",
  },
  light: {
    level: "medium",
    summary: "Stage lighting and occasional effects. No strobe listed.",
  },
  touch: {
    level: "low",
    summary: "No audience contact. Standing and seated options.",
  },
  content: {
    level: "medium",
    summary: "Strong language in some lyrics. General audience.",
  },
  space: {
    level: "medium",
    summary: "Mixed standing and seated. Crowd density varies. Interval allows movement.",
  },
  intervalAndTiming: {
    level: "medium",
    summary: "One interval around 20 minutes in. Total show approx 2 hours.",
  },
  exitInfo: "Multiple exits. Bar area can be busy during interval.",
  intervalDetails: "Interval approximately 20 minutes in.",
  confidence: "high",
  confidenceSource: "Inferred from event listing + rider",
  accessibilityFeatures: ["Seated and standing options", "No strobes"],
};

export const sampleEvents: Event[] = [
  {
    id: "sample-1",
    title: "The Crossing",
    venue: "Traverse Theatre",
    date: "2025-04-12",
    duration: "70 min",
    eventType: "theatre",
    fingerprint: crossingFingerprint,
  },
  {
    id: "sample-2",
    title: "Still Life",
    venue: "Scottish Gallery",
    date: "2025-03-20",
    eventType: "exhibition",
    fingerprint: stillLifeFingerprint,
  },
  {
    id: "sample-3",
    title: "Northern Soul",
    venue: "Queen's Hall",
    date: "2025-05-01",
    duration: "~2 hours",
    eventType: "music",
    fingerprint: northernSoulFingerprint,
  },
];

export {
  crossingFingerprint,
  stillLifeFingerprint,
  northernSoulFingerprint,
};
