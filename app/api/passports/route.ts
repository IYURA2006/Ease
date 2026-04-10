import { NextResponse } from "next/server";
import { getAllPassports } from "@/lib/store";

export async function GET() {
  const passports = getAllPassports();
  return NextResponse.json(passports);
}
