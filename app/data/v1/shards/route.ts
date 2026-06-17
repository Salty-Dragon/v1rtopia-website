import { NextResponse } from "next/server";
import { getShards } from "@/lib/stats-queries";

export async function GET() {
  try {
    const data = await getShards();
    return NextResponse.json({ count: data.length, data });
  } catch (error) {
    console.error("[api] shards failed:", error);
    return NextResponse.json({ error: "Failed to load shard stats" }, { status: 500 });
  }
}
