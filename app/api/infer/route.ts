import { NextResponse } from "next/server";
import OpenAI from "openai/index.js";
import type { SensoryFingerprint } from "@/lib/types";
import { SENSORY_FINGERPRINT_SCHEMA } from "@/lib/fingerprintSchema";

const systemPrompt = `You are an accessibility consultant specialising in sensory access for live performance and cultural events in Scotland. You have been given text from a script, technical rider, and/or event listing. Read everything carefully and infer a complete sensory profile.

Be honest and specific. Flag the gunshot in scene 3 with its timing. Flag the strobe at LX cue 14. Flag themes of grief and violence clearly.

An autistic person or someone with PTSD needs specific, honest information to make a safe decision. Do not be vague. Do not be falsely reassuring.

If only an event listing was provided (no script or rider), set confidence to 'low' and note this in aiNotes.

Return ONLY a valid JSON object matching the SensoryFingerprint schema exactly. No markdown. No preamble. Raw JSON only.

${SENSORY_FINGERPRINT_SCHEMA}`;

function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      scriptText,
      riderText,
      scrapedText,
      showTitle,
      venue,
    } = body as {
      scriptText: string;
      riderText?: string;
      scrapedText?: string;
      showTitle: string;
      venue: string;
    };

    if (!scriptText && !scrapedText) {
      return NextResponse.json(
        { error: "At least scriptText or scrapedText required" },
        { status: 400 }
      );
    }

    const sections: string[] = [];
    if (scriptText) sections.push("[SCRIPT]\n" + scriptText);
    if (riderText) sections.push("[TECH RIDER]\n" + riderText);
    if (scrapedText) sections.push("[EVENT LISTING]\n" + scrapedText);

    const userContent =
      `Show: ${showTitle}\nVenue: ${venue}\n\n` + sections.join("\n\n---\n\n");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    if (!raw) {
      return NextResponse.json(
        { error: "No text in OpenAI response" },
        { status: 500 }
      );
    }

    const jsonStr = stripMarkdownFences(raw);
    const fingerprint = JSON.parse(jsonStr) as SensoryFingerprint;

    // Basic validation
    const required = [
      "sound",
      "light",
      "touch",
      "content",
      "space",
      "intervalAndTiming",
      "exitInfo",
      "intervalDetails",
      "confidence",
      "confidenceSource",
    ];
    for (const key of required) {
      if (!(key in fingerprint)) {
        return NextResponse.json(
          { error: `Invalid fingerprint: missing ${key}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(fingerprint);
  } catch (e) {
    console.error("infer error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Inference failed" },
      { status: 500 }
    );
  }
}
