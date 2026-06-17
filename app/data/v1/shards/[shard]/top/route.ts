import { NextRequest, NextResponse } from "next/server";
import { clampLimit, getShardTop } from "@/lib/stats-queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shard: string }> }
) {
  const { shard } = await params;
  if (!/^[a-z_]{1,24}$/.test(shard)) {
    return NextResponse.json({ error: "Invalid shard" }, { status: 400 });
  }
  const limit = clampLimit(request.nextUrl.searchParams.get("limit"));
  try {
    const data = await getShardTop(shard, limit);
    return NextResponse.json({ shard, count: data.length, data });
  } catch (error) {
    console.error(`[api] shards/${shard}/top failed:`, error);
    return NextResponse.json({ error: "Failed to load shard leaderboard" }, { status: 500 });
  }
}
