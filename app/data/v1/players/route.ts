import { NextRequest, NextResponse } from "next/server";
import { getPlayerByName } from "@/lib/stats-queries";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim();
  if (!name || name.length < 1 || name.length > 16) {
    return NextResponse.json({ error: "Provide ?name=<1-16 chars>" }, { status: 400 });
  }
  try {
    const profile = await getPlayerByName(name);
    if (!profile) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[api] players?name= failed:", error);
    return NextResponse.json({ error: "Failed to load player" }, { status: 500 });
  }
}
