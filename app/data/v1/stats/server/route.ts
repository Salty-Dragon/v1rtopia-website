import { NextResponse } from "next/server";
import { getServerStats } from "@/lib/stats-queries";

export async function GET() {
  try {
    return NextResponse.json(await getServerStats());
  } catch (error) {
    console.error("[api] stats/server failed:", error);
    return NextResponse.json({ error: "Failed to load server stats" }, { status: 500 });
  }
}
