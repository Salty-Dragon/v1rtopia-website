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

// Track if API is available to avoid repeated failed requests
let apiAvailable: boolean | null = null;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 60000; // Check every 60 seconds

async function fetchWithRetry<T>(
  url: string,
  retries = 0,
  delay = 1000
): Promise<ApiResponse<T>> {
  // Check API health periodically
  const now = Date.now();
  if (apiAvailable === null || now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
    apiAvailable = await checkApiHealth();
    lastHealthCheck = now;
  }

  // Skip request if API is known to be unavailable
  if (!apiAvailable) {
    return { error: 'API unavailable' };
  }
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
        // Mark API as unavailable on connection errors
        if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))) {
          apiAvailable = false;
        }
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
