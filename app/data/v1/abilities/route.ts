import { NextRequest, NextResponse } from "next/server";
import { clampLimit, getAbilities } from "@/lib/stats-queries";

export async function GET(request: NextRequest) {
  const limit = clampLimit(request.nextUrl.searchParams.get("limit"));
  try {
    const data = await getAbilities(limit);
    return NextResponse.json({ count: data.length, data });
  } catch (error) {
    console.error("[api] abilities failed:", error);
    return NextResponse.json({ error: "Failed to load ability stats" }, { status: 500 });
  }
}
