import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { setPassport } from "@/lib/store";
import type { SensoryFingerprint } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fingerprint,
      showTitle,
      venue,
      duration,
      date,
      eventType,
    } = body as {
      fingerprint: SensoryFingerprint;
      showTitle: string;
      venue: string;
      duration?: string;
      date?: string;
      eventType?: string;
    };

    if (!fingerprint || !showTitle || !venue) {
      return NextResponse.json(
        { error: "fingerprint, showTitle, and venue are required" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const url = `${BASE_URL}/passport/${id}`;

    const qrCode = await QRCode.toDataURL(url, {
      type: "image/png",
      margin: 2,
      width: 200,
      color: { dark: "#1C1917", light: "#FAF8F5" },
    });

    const record = {
      id,
      fingerprint,
      showTitle,
      venue,
      duration,
      date,
      eventType,
      createdAt: new Date().toISOString(),
    };

    setPassport(record);

    return NextResponse.json({
      id,
      url,
      qrCode,
    });
  } catch (e) {
    console.error("passport create error", e);
    return NextResponse.json(
      { error: "Failed to create passport" },
      { status: 500 }
    );
  }
}
