import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/stats-queries";

const UUID_RE = /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  if (!UUID_RE.test(uuid)) {
    return NextResponse.json({ error: "Invalid UUID" }, { status: 400 });
  }
  try {
    const profile = await getPlayer(uuid);
    if (!profile) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[api] players/[uuid] failed:", error);
    return NextResponse.json({ error: "Failed to load player" }, { status: 500 });
  }
}
