import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".txt")) {
      const text = await file.text();
      return NextResponse.json({ text });
    }

    if (name.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (b: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      return NextResponse.json({ text: data.text });
    }

    // .docx not parsed in basic setup — could add mammoth later
    if (name.endsWith(".docx")) {
      return NextResponse.json(
        { error: "DOCX support: extract text manually or add mammoth" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unsupported file type. Use PDF or TXT." },
      { status: 400 }
    );
  } catch (e) {
    console.error("parse-pdf error", e);
    return NextResponse.json(
      { error: "Failed to parse file" },
      { status: 500 }
    );
  }
}
