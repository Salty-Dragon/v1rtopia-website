// Client-side API helpers for the ShardsSMPv2 V2 stats endpoints.
// The API is served same-origin by this app's /data/v1 route handlers (nginx
// reserves /api for the legacy service), so paths are relative. Server components
// should import lib/stats-queries directly instead.

const API_BASE_URL = ""; // same-origin; relative /data/v1/* paths

// ========================================
// TYPE DEFINITIONS (V2 contract)
// ========================================

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
  value: number;
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

export type LeaderboardType =
  | "kills"
  | "deaths"
  | "kd"
  | "playtime"
  | "mob_kills"
  | "blocks_broken"
  | "blocks_placed"
  | "damage_dealt"
  | "damage_taken";

export interface LeaderboardResponse {
  leaderboard: string;
  count: number;
  data: LeaderboardEntry[];
}

export interface ShardStat {
  shard_type: string;
  players: number;
  pvp_kills: number;
  pvp_deaths: number;
  ability_uses: number;
  playtime_minutes: number;
}

export interface ShardsResponse {
  count: number;
  data: ShardStat[];
}

export interface AbilityStat {
  ability_key: string;
  shard_type: string;
  total_uses: number;
  unique_users: number;
}

export interface AbilitiesResponse {
  count: number;
  data: AbilityStat[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  cached?: boolean;
}

// ========================================
// ERROR HANDLING
// ========================================

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ========================================
// FETCH WRAPPER
// ========================================

// Module-level health gate so a down API doesn't trigger a request per render.
let apiAvailable: boolean | null = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000;

async function fetchWithRetry<T>(url: string, retries = 0, delay = 1000): Promise<ApiResponse<T>> {
  const now = Date.now();
  if (apiAvailable === null || now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
    apiAvailable = await checkApiHealth();
    lastHealthCheck = now;
  }
  if (!apiAvailable) {
    return { error: "API unavailable" };
  }

  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 429) {
        if (i < retries) {
          await new Promise((r) => setTimeout(r, delay * (i + 1)));
          continue;
        }
        throw new ApiError(429, "Rate limit exceeded");
      }
      if (!response.ok) {
        throw new ApiError(response.status, `API request failed: ${response.statusText}`);
      }
      const jsonData = await response.json();
      return { data: jsonData as T };
    } catch (error) {
      clearTimeout(timeoutId);
      if (i === retries) {
        if (error instanceof Error && (error.name === "AbortError" || error instanceof TypeError)) {
          apiAvailable = false;
        }
        if (error instanceof ApiError) {
          return { error: error.message };
        }
        return { error: error instanceof Error ? error.message : "Unknown error" };
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return { error: "Failed after retries" };
}

// ========================================
// ENDPOINTS
// ========================================

export async function fetchServerStats(): Promise<ApiResponse<ServerStats>> {
  return fetchWithRetry<ServerStats>(`${API_BASE_URL}/data/v1/stats/server`);
}

export async function fetchLeaderboard(
  type: LeaderboardType,
  limit = 10
): Promise<ApiResponse<LeaderboardResponse>> {
  return fetchWithRetry<LeaderboardResponse>(
    `${API_BASE_URL}/data/v1/leaderboards/${type}?limit=${limit}`
  );
}

export async function fetchShards(): Promise<ApiResponse<ShardsResponse>> {
  return fetchWithRetry<ShardsResponse>(`${API_BASE_URL}/data/v1/shards`);
}

export async function fetchShardTop(
  shard: string,
  limit = 10
): Promise<ApiResponse<{ shard: string; count: number; data: LeaderboardEntry[] }>> {
  return fetchWithRetry(`${API_BASE_URL}/data/v1/shards/${shard}/top?limit=${limit}`);
}

export async function fetchAbilities(limit = 20): Promise<ApiResponse<AbilitiesResponse>> {
  return fetchWithRetry<AbilitiesResponse>(`${API_BASE_URL}/data/v1/abilities?limit=${limit}`);
}

export async function checkApiHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  try {
    const response = await fetch(`${API_BASE_URL}/data/v1/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}
