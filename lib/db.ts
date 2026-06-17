// Server-only MariaDB access for the ShardsSMPv2 stats database (shards_v2).
// Used by the /api/v1 route handlers; never import this from a client component.
import mysql from "mysql2/promise";

// Reuse one pool across hot-reloads in dev (module re-eval would otherwise leak pools).
const globalForPool = globalThis as unknown as { _shardsStatsPool?: mysql.Pool };

export function getPool(): mysql.Pool {
  if (!globalForPool._shardsStatsPool) {
    globalForPool._shardsStatsPool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "shards_v2",
      connectionLimit: 5,
      waitForConnections: true,
      // BINARY(16) columns come back as Buffer by default — converted explicitly below.
    });
  }
  return globalForPool._shardsStatsPool;
}

/** Runs a read query and returns the typed rows. */
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

/** BINARY(16) Buffer → canonical hyphenated UUID string. */
export function uuidToString(value: Buffer | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const hex = value.toString("hex");
  return (
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-` +
    `${hex.slice(16, 20)}-${hex.slice(20)}`
  );
}

/** Canonical/loose UUID string → BINARY(16) Buffer for parameter binding. */
export function uuidToBytes(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error("Invalid UUID");
  }
  return Buffer.from(hex, "hex");
}
