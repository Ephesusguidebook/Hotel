import mysql from "mysql2/promise";

// Plain mysql2 (no ORM, no native query-engine binary) — deliberately chosen
// because this project's host has already shown it can't load native
// binaries built for a different glibc (see next.config.mjs / package.json
// build script history). mysql2 talks the MySQL wire protocol in pure JS.
//
// Set DATABASE_URL in the environment, e.g.:
//   mysql://user:password@host:3306/database
// Locally, put it in a .env.local file (gitignored). On Hostinger, set it
// under the deployment's "Environment variables" panel.

let pool: mysql.Pool | null = null;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 60000,
      connectTimeout: 8000,
    });
  }
  return pool;
}

/**
 * Run a query, returning `null` instead of throwing when the database is
 * unreachable or not configured. Callers fall back to static seed data in
 * that case, so the public site keeps working even if the DB is down.
 */
export async function safeQuery<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<T[] | null> {
  const p = getPool();
  if (!p) return null;
  try {
    const [rows] = await p.query(sql, params);
    return rows as T[];
  } catch (err) {
    console.error("[db] query failed, falling back to static data:", err);
    return null;
  }
}
