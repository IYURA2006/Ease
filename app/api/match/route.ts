import { NextResponse } from "next/server";
import OpenAI from "openai/index.js";
import type { SensoryFingerprint } from "@/lib/types";
import type { MatchResult } from "@/lib/types";

const systemPrompt = `You are a friendly accessibility advisor helping someone decide whether a specific arts event is suitable for their access needs. Be warm, encouraging, and practical. Most people can enjoy most events with the right preparation — lean towards "suitable" or "suitable_with_preparation" unless the event would genuinely be very difficult or harmful for this person. Focus on empowering the person with helpful tips rather than warning them away.

Use 'you' language. Write as if speaking directly to this person. Highlight what will work well for them, and only flag genuine concerns.

Reserve "not_recommended" for situations where the event would very likely cause significant distress or be inaccessible in a way that cannot be mitigated. Otherwise default to "suitable" or "suitable_with_preparation".

Return ONLY valid JSON — no markdown, no preamble:
{
  "verdict": "suitable" | "suitable_with_preparation" | "not_recommended",
  "explanation": string,
  "flags": string[],
  "suggestions": string[],
  "reassurances": string[]
}`;

function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { needs, fingerprint } = body as {
      needs: string;
      fingerprint: SensoryFingerprint;
    };

    if (!needs || !fingerprint) {
      return NextResponse.json(
        { error: "needs and fingerprint are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured" },
        { status: 503 }
      );
    }

    const fingerprintStr = JSON.stringify(fingerprint, null, 2);
    const userContent = `Person's access needs:\n${needs}\n\nEvent sensory fingerprint:\n${fingerprintStr}`;

    const openai = new OpenAI({ apiKey });
    const message = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const textContent = message.choices[0]?.message?.content;
    if (!textContent) {
      return NextResponse.json(
        { error: "No text in OpenAI response" },
        { status: 500 }
      );
    }

    const jsonStr = stripMarkdownFences(textContent);
    const result = JSON.parse(jsonStr) as MatchResult;

    if (
      !["suitable", "suitable_with_preparation", "not_recommended"].includes(
        result.verdict
      )
    ) {
      return NextResponse.json(
        { error: "Invalid verdict in response" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("match error", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Match failed" },
      { status: 500 }
    );
  }
}
