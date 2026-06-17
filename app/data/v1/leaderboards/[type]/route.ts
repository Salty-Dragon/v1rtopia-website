import { NextRequest, NextResponse } from "next/server";
import {
  clampLimit,
  getLeaderboard,
  isLeaderboardType,
  LEADERBOARD_TYPES,
} from "@/lib/stats-queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!isLeaderboardType(type)) {
    return NextResponse.json(
      { error: `Unknown leaderboard '${type}'. Valid: ${LEADERBOARD_TYPES.join(", ")}` },
      { status: 400 }
    );
  }
  const limit = clampLimit(request.nextUrl.searchParams.get("limit"));
  try {
    const data = await getLeaderboard(type, limit);
    return NextResponse.json({ leaderboard: type, count: data.length, data });
  } catch (error) {
    console.error(`[api] leaderboards/${type} failed:`, error);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}
