import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid url" },
        { status: 400 }
      );
    }

    const res = await fetch(url, {
      headers: { "User-Agent": "ThresholdBot/1.0 (accessibility)" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${res.status}` },
        { status: 400 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Prefer accessibility/description/synopsis
    const title =
      $("meta[property='og:title']").attr("content") ||
      $("title").text() ||
      "";
    const desc =
      $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      "";

    const parts: string[] = [];
    if (title) parts.push(`Title: ${title.trim()}`);
    if (desc) parts.push(desc.trim());

    $("p, li, [class*='accessibility'], [class*='description'], [class*='synopsis']").each(
      (_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20) parts.push(text);
      }
    );

    const text = parts.join("\n\n");
    return NextResponse.json({ text, title: title.trim() });
  } catch (e) {
    console.error("scrape-url error", e);
    return NextResponse.json(
      { error: "Failed to scrape URL" },
      { status: 500 }
    );
  }
}
