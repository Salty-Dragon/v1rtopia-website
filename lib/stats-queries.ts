// Server-only query layer over the ShardsSMPv2 stats schema (shards_v2).
// Route handlers and server components call these; results are cached ~30s
// (the plugin flushes every 60s) to shield the DB from visitor bursts.
import { unstable_cache } from "next/cache";
import { query, uuidToString, uuidToBytes } from "@/lib/db";

// In-process TTL memo with single-flight, used for per-player lookups.
//
// Unlike unstable_cache({ revalidate }) — which is stale-while-revalidate: once
// an entry expires it returns the STALE value and refreshes in the background,
// so the *next* request is the first to see fresh data — this awaits a fresh
// result the moment an entry expires. Callers therefore never see stale stats
// (which made a profile look "one lookup behind"), while bursts within the TTL
// still share a single result and concurrent calls for the same key are deduped.
function ttlMemo<A extends unknown[], T>(
  fn: (...args: A) => Promise<T>,
  keyOf: (...args: A) => string,
  ttlMs: number,
  maxEntries = 500
): (...args: A) => Promise<T> {
  const fresh = new Map<string, { value: T; expires: number }>();
  const inflight = new Map<string, Promise<T>>();

  return (...args: A): Promise<T> => {
    const key = keyOf(...args);
    const now = Date.now();

    const hit = fresh.get(key);
    if (hit && hit.expires > now) return Promise.resolve(hit.value);

    const pending = inflight.get(key);
    if (pending) return pending;

    const p = (async () => {
      try {
        const value = await fn(...args);
        fresh.set(key, { value, expires: Date.now() + ttlMs });
        // Bound memory: drop expired entries first, then oldest by insertion.
        if (fresh.size > maxEntries) {
          const cutoff = Date.now();
          for (const [k, v] of fresh) if (v.expires <= cutoff) fresh.delete(k);
          while (fresh.size > maxEntries) {
            const oldest = fresh.keys().next().value;
            if (oldest === undefined) break;
            fresh.delete(oldest);
          }
        }
        return value;
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, p);
    return p;
  };
}

// ----------------------------------------------------------------------------
// Types (the JSON contract surfaced by /api/v1)
// ----------------------------------------------------------------------------

export interface ServerStats {
  total_players: number;
  total_pvp_kills: number;
  total_pvp_deaths: number;
  total_mob_kills: number;
  total_blocks_broken: number;
  total_blocks_placed: number;
  total_playtime_minutes: number;
  active_last_7_days: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  uuid: string;
  username: string;
  current_shard: string | null;
  last_seen: string;
  value: number; // the metric this board is sorted by
  pvp_kills: number;
  pvp_deaths: number;
  kd: number;
  mob_kills: number;
  blocks_broken: number;
  blocks_placed: number;
  damage_dealt: number;
  damage_taken: number;
  playtime_minutes: number;
}

export interface ShardStat {
  shard_type: string;
  players: number;
  pvp_kills: number;
  pvp_deaths: number;
  ability_uses: number;
  playtime_minutes: number;
}

export interface ShardTopEntry {
  rank: number;
  uuid: string;
  username: string;
  pvp_kills: number;
  pvp_deaths: number;
  kd: number;
  ability_uses: number;
  playtime_minutes: number;
}

export interface AbilityStat {
  ability_key: string;
  shard_type: string;
  total_uses: number;
  unique_users: number;
}

export interface PlayerProfile {
  uuid: string;
  username: string;
  current_shard: string | null;
  last_seen: string;
  pvp_kills: number;
  pvp_deaths: number;
  kd: number;
  mob_kills: number;
  blocks_broken: number;
  blocks_placed: number;
  damage_dealt: number;
  damage_taken: number;
  playtime_minutes: number;
  shards: ShardTopEntry[];
  abilities: AbilityStat[];
}

// ----------------------------------------------------------------------------
// Leaderboard metric allowlist — maps a public type to a safe SQL column.
// ----------------------------------------------------------------------------

export const LEADERBOARD_TYPES = [
  "kills",
  "deaths",
  "kd",
  "playtime",
  "mob_kills",
  "blocks_broken",
  "blocks_placed",
  "damage_dealt",
  "damage_taken",
] as const;

export type LeaderboardType = (typeof LEADERBOARD_TYPES)[number];

export function isLeaderboardType(value: string): value is LeaderboardType {
  return (LEADERBOARD_TYPES as readonly string[]).includes(value);
}

// Order-by expression per type (never interpolated from user input directly —
// only these constant fragments are ever spliced into SQL).
const ORDER_BY: Record<LeaderboardType, string> = {
  kills: "s.pvp_kills DESC",
  deaths: "s.pvp_deaths DESC",
  kd: "kd DESC, s.pvp_kills DESC",
  playtime: "s.playtime_seconds DESC",
  mob_kills: "s.mob_kills DESC",
  blocks_broken: "s.blocks_broken DESC",
  blocks_placed: "s.blocks_placed DESC",
  damage_dealt: "s.damage_dealt DESC",
  damage_taken: "s.damage_taken DESC",
};

// Expression that selects the board's headline value (aliased `value`).
const VALUE_EXPR: Record<LeaderboardType, string> = {
  kills: "s.pvp_kills",
  deaths: "s.pvp_deaths",
  kd: "ROUND(COALESCE(s.pvp_kills / NULLIF(s.pvp_deaths, 0), s.pvp_kills), 2)",
  playtime: "FLOOR(s.playtime_seconds / 60)",
  mob_kills: "s.mob_kills",
  blocks_broken: "s.blocks_broken",
  blocks_placed: "s.blocks_placed",
  damage_dealt: "ROUND(s.damage_dealt, 1)",
  damage_taken: "ROUND(s.damage_taken, 1)",
};

export const MIN_LIMIT = 1;
export const MAX_LIMIT = 100;
export const DEFAULT_LIMIT = 10;

export function clampLimit(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.floor(n)));
}

// ----------------------------------------------------------------------------
// Row shapes returned by the driver (uuid is a Buffer; dates are Date objects)
// ----------------------------------------------------------------------------

interface PlayerRow {
  uuid: Buffer;
  username: string;
  current_shard: string | null;
  last_seen: Date;
  pvp_kills: number;
  pvp_deaths: number;
  kd: number | null;
  mob_kills: number;
  blocks_broken: number;
  blocks_placed: number;
  damage_dealt: number;
  damage_taken: number;
  playtime_minutes: number;
  value?: number | null;
}

const PLAYER_SELECT = `
  s.uuid                                          AS uuid,
  p.name                                          AS username,
  p.shard_type                                    AS current_shard,
  p.last_seen                                     AS last_seen,
  s.pvp_kills                                     AS pvp_kills,
  s.pvp_deaths                                    AS pvp_deaths,
  ROUND(COALESCE(s.pvp_kills / NULLIF(s.pvp_deaths, 0), s.pvp_kills), 2) AS kd,
  s.mob_kills                                     AS mob_kills,
  s.blocks_broken                                 AS blocks_broken,
  s.blocks_placed                                 AS blocks_placed,
  ROUND(s.damage_dealt, 1)                        AS damage_dealt,
  ROUND(s.damage_taken, 1)                        AS damage_taken,
  FLOOR(s.playtime_seconds / 60)                  AS playtime_minutes`;

function mapPlayerRow(row: PlayerRow, rank: number): LeaderboardEntry {
  return {
    rank,
    uuid: uuidToString(row.uuid),
    username: row.username,
    current_shard: row.current_shard,
    last_seen: row.last_seen?.toISOString?.() ?? String(row.last_seen),
    value: Number(row.value ?? 0),
    pvp_kills: Number(row.pvp_kills),
    pvp_deaths: Number(row.pvp_deaths),
    kd: Number(row.kd ?? 0),
    mob_kills: Number(row.mob_kills),
    blocks_broken: Number(row.blocks_broken),
    blocks_placed: Number(row.blocks_placed),
    damage_dealt: Number(row.damage_dealt),
    damage_taken: Number(row.damage_taken),
    playtime_minutes: Number(row.playtime_minutes),
  };
}

// ----------------------------------------------------------------------------
// Cached queries
// ----------------------------------------------------------------------------

export const getServerStats = unstable_cache(
  async (): Promise<ServerStats> => {
    const [agg] = await query<{
      total_pvp_kills: number;
      total_pvp_deaths: number;
      total_mob_kills: number;
      total_blocks_broken: number;
      total_blocks_placed: number;
      total_playtime_minutes: number;
    }>(`
      SELECT
        COALESCE(SUM(pvp_kills), 0)               AS total_pvp_kills,
        COALESCE(SUM(pvp_deaths), 0)              AS total_pvp_deaths,
        COALESCE(SUM(mob_kills), 0)               AS total_mob_kills,
        COALESCE(SUM(blocks_broken), 0)           AS total_blocks_broken,
        COALESCE(SUM(blocks_placed), 0)           AS total_blocks_placed,
        FLOOR(COALESCE(SUM(playtime_seconds), 0) / 60) AS total_playtime_minutes
      FROM player_stats`);

    const [players] = await query<{ total_players: number; active_last_7_days: number }>(`
      SELECT
        COUNT(*) AS total_players,
        SUM(last_seen >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS active_last_7_days
      FROM players`);

    return {
      total_players: Number(players?.total_players ?? 0),
      total_pvp_kills: Number(agg?.total_pvp_kills ?? 0),
      total_pvp_deaths: Number(agg?.total_pvp_deaths ?? 0),
      total_mob_kills: Number(agg?.total_mob_kills ?? 0),
      total_blocks_broken: Number(agg?.total_blocks_broken ?? 0),
      total_blocks_placed: Number(agg?.total_blocks_placed ?? 0),
      total_playtime_minutes: Number(agg?.total_playtime_minutes ?? 0),
      active_last_7_days: Number(players?.active_last_7_days ?? 0),
      timestamp: new Date().toISOString(),
    };
  },
  ["server-stats"],
  { revalidate: 30 }
);

export const getLeaderboard = unstable_cache(
  async (type: LeaderboardType, limit: number): Promise<LeaderboardEntry[]> => {
    const rows = await query<PlayerRow>(
      `SELECT ${PLAYER_SELECT}, ${VALUE_EXPR[type]} AS value
       FROM player_stats s
       JOIN players p ON p.uuid = s.uuid
       ORDER BY ${ORDER_BY[type]}, p.name ASC
       LIMIT ?`,
      [limit]
    );
    return rows.map((row, i) => mapPlayerRow(row, i + 1));
  },
  ["leaderboard"],
  { revalidate: 30 }
);

export const getShards = unstable_cache(
  async (): Promise<ShardStat[]> => {
    const rows = await query<{
      shard_type: string;
      players: number;
      pvp_kills: number;
      pvp_deaths: number;
      ability_uses: number;
      playtime_minutes: number;
    }>(`
      SELECT
        shard_type,
        COUNT(DISTINCT uuid)               AS players,
        COALESCE(SUM(pvp_kills), 0)        AS pvp_kills,
        COALESCE(SUM(pvp_deaths), 0)       AS pvp_deaths,
        COALESCE(SUM(ability_uses), 0)     AS ability_uses,
        FLOOR(COALESCE(SUM(playtime_seconds), 0) / 60) AS playtime_minutes
      FROM player_shard_stats
      GROUP BY shard_type
      ORDER BY players DESC, playtime_minutes DESC`);
    return rows.map((r) => ({
      shard_type: r.shard_type,
      players: Number(r.players),
      pvp_kills: Number(r.pvp_kills),
      pvp_deaths: Number(r.pvp_deaths),
      ability_uses: Number(r.ability_uses),
      playtime_minutes: Number(r.playtime_minutes),
    }));
  },
  ["shards"],
  { revalidate: 30 }
);

export const getShardTop = unstable_cache(
  async (shard: string, limit: number): Promise<ShardTopEntry[]> => {
    const rows = await query<{
      uuid: Buffer;
      username: string;
      pvp_kills: number;
      pvp_deaths: number;
      kd: number | null;
      ability_uses: number;
      playtime_minutes: number;
    }>(
      `SELECT
         ss.uuid AS uuid,
         p.name  AS username,
         ss.pvp_kills,
         ss.pvp_deaths,
         ROUND(COALESCE(ss.pvp_kills / NULLIF(ss.pvp_deaths, 0), ss.pvp_kills), 2) AS kd,
         ss.ability_uses,
         FLOOR(ss.playtime_seconds / 60) AS playtime_minutes
       FROM player_shard_stats ss
       JOIN players p ON p.uuid = ss.uuid
       WHERE ss.shard_type = ?
       ORDER BY ss.pvp_kills DESC, ss.playtime_seconds DESC, p.name ASC
       LIMIT ?`,
      [shard, limit]
    );
    return rows.map((r, i) => ({
      rank: i + 1,
      uuid: uuidToString(r.uuid),
      username: r.username,
      pvp_kills: Number(r.pvp_kills),
      pvp_deaths: Number(r.pvp_deaths),
      kd: Number(r.kd ?? 0),
      ability_uses: Number(r.ability_uses),
      playtime_minutes: Number(r.playtime_minutes),
    }));
  },
  ["shard-top"],
  { revalidate: 30 }
);

export const getAbilities = unstable_cache(
  async (limit: number): Promise<AbilityStat[]> => {
    const rows = await query<{
      ability_key: string;
      shard_type: string;
      total_uses: number;
      unique_users: number;
    }>(
      `SELECT
         ability_key,
         MAX(shard_type)          AS shard_type,
         COALESCE(SUM(times_used), 0) AS total_uses,
         COUNT(DISTINCT uuid)     AS unique_users
       FROM ability_usage
       GROUP BY ability_key
       ORDER BY total_uses DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map((r) => ({
      ability_key: r.ability_key,
      shard_type: r.shard_type,
      total_uses: Number(r.total_uses),
      unique_users: Number(r.unique_users),
    }));
  },
  ["abilities"],
  { revalidate: 30 }
);

export const getPlayer = ttlMemo(
  async (uuid: string): Promise<PlayerProfile | null> => {
    const key = uuidToBytes(uuid);
    const [row] = await query<PlayerRow>(
      `SELECT ${PLAYER_SELECT}
       FROM player_stats s
       JOIN players p ON p.uuid = s.uuid
       WHERE s.uuid = ?`,
      [key]
    );
    if (!row) return null;
    const base = mapPlayerRow(row, 0);

    const shards = await query<{
      uuid: Buffer;
      shard_type: string;
      pvp_kills: number;
      pvp_deaths: number;
      kd: number | null;
      ability_uses: number;
      playtime_minutes: number;
    }>(
      `SELECT ss.shard_type, ss.pvp_kills, ss.pvp_deaths,
              ROUND(COALESCE(ss.pvp_kills / NULLIF(ss.pvp_deaths, 0), ss.pvp_kills), 2) AS kd,
              ss.ability_uses, FLOOR(ss.playtime_seconds / 60) AS playtime_minutes
       FROM player_shard_stats ss WHERE ss.uuid = ?
       ORDER BY ss.playtime_seconds DESC`,
      [key]
    );
    const abilities = await query<{
      ability_key: string;
      shard_type: string;
      total_uses: number;
    }>(
      `SELECT ability_key, shard_type, times_used AS total_uses
       FROM ability_usage WHERE uuid = ? ORDER BY times_used DESC`,
      [key]
    );

    return {
      uuid: base.uuid,
      username: base.username,
      current_shard: base.current_shard,
      last_seen: base.last_seen,
      pvp_kills: base.pvp_kills,
      pvp_deaths: base.pvp_deaths,
      kd: base.kd,
      mob_kills: base.mob_kills,
      blocks_broken: base.blocks_broken,
      blocks_placed: base.blocks_placed,
      damage_dealt: base.damage_dealt,
      damage_taken: base.damage_taken,
      playtime_minutes: base.playtime_minutes,
      shards: shards.map((r, i) => ({
        rank: i + 1,
        uuid: base.uuid,
        username: base.username,
        pvp_kills: Number(r.pvp_kills),
        pvp_deaths: Number(r.pvp_deaths),
        kd: Number(r.kd ?? 0),
        ability_uses: Number(r.ability_uses),
        playtime_minutes: Number(r.playtime_minutes),
      })),
      abilities: abilities.map((r) => ({
        ability_key: r.ability_key,
        shard_type: r.shard_type,
        total_uses: Number(r.total_uses),
        unique_users: 1,
      })),
    };
  },
  (uuid) => `player:${uuid}`,
  30_000
);

export const getPlayerByName = ttlMemo(
  async (name: string): Promise<PlayerProfile | null> => {
    const [row] = await query<{ uuid: Buffer }>(
      `SELECT uuid FROM players WHERE name = ? LIMIT 1`,
      [name]
    );
    if (!row) return null;
    return getPlayer(uuidToString(row.uuid));
  },
  (name) => `player-by-name:${name.toLowerCase()}`,
  30_000
);
