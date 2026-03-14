import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { SensoryFingerprint } from "@/lib/types";
import type { MatchResult } from "@/lib/types";

const systemPrompt = `You are an accessibility advisor helping someone decide whether a specific arts event is suitable for their access needs. Be compassionate, specific, and honest. Do not be falsely reassuring — if something will likely be difficult, say so clearly. If the show is largely suitable, reassure them specifically.

Use 'you' language. Write as if speaking directly to this person.

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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 503 }
      );
    }

    const fingerprintStr = JSON.stringify(fingerprint, null, 2);
    const userContent = `Person's access needs:\n${needs}\n\nEvent sensory fingerprint:\n${fingerprintStr}`;

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text in Claude response" },
        { status: 500 }
      );
    }

    const jsonStr = stripMarkdownFences(textBlock.text);
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
