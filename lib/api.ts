// API Configuration and Type Definitions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface ServerStats {
  total_players: number;
  total_kills: number;
  total_deaths: number;
  total_experience: number;
  active_last_7_days: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  uuid: string;
  username: string;
  kills?: number;
  deaths?: number;
  kd_ratio?: number;
  experience?: number;
  playtime_minutes?: number;
  current_shard?: string;
  last_seen: string;
}

export interface LeaderboardResponse {
  leaderboard: string;
  count: number;
  data: LeaderboardEntry[];
  cached?: boolean;
  cachedAt?: string;
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
    this.name = 'ApiError';
  }
}

// ========================================
// FETCH WRAPPER FUNCTIONS
// ========================================

async function fetchWithRetry<T>(
  url: string,
  retries = 2,
  delay = 1000
): Promise<ApiResponse<T>> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.status === 429) {
        // Rate limited - wait and retry
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        throw new ApiError(429, 'Rate limit exceeded');
      }

      if (!response.ok) {
        throw new ApiError(response.status, `API request failed: ${response.statusText}`);
      }

      const jsonData = await response.json();
      return { data: jsonData as T, cached: jsonData.cached };
    } catch (error) {
      if (i === retries) {
        if (error instanceof ApiError) {
          return { error: error.message };
        }
        return { error: error instanceof Error ? error.message : 'Unknown error' };
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return { error: 'Failed after retries' };
}

// ========================================
// API ENDPOINT FUNCTIONS
// ========================================

/**
 * Fetch server statistics
 */
export async function fetchServerStats(): Promise<ApiResponse<ServerStats>> {
  const url = `${API_BASE_URL}/api/v1/stats/server`;
  return fetchWithRetry<ServerStats>(url);
}

/**
 * Fetch leaderboard data
 * @param type - Type of leaderboard (kills, kd, experience, playtime)
 * @param limit - Number of entries to fetch (default: 5)
 */
export async function fetchLeaderboard(
  type: 'kills' | 'kd' | 'experience' | 'playtime',
  limit: number = 5
): Promise<ApiResponse<LeaderboardResponse>> {
  const url = `${API_BASE_URL}/api/v1/leaderboards/${type}?limit=${limit}`;
  return fetchWithRetry<LeaderboardResponse>(url);
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}
