import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getPassport } from "@/lib/store";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = getPassport(id);
  if (!record) {
    return NextResponse.json(
      { error: "This passport could not be found. It may have expired or the link may be incorrect." },
      { status: 404 }
    );
  }
  const url = `${BASE_URL}/passport/${id}`;
  const qrCode = await QRCode.toDataURL(url, {
    type: "image/png",
    margin: 2,
    width: 200,
    color: { dark: "#1C1917", light: "#FAF8F5" },
  });
  return NextResponse.json({ ...record, qrCode });
}
