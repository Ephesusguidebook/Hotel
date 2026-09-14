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
      // Return DATE/DATETIME/TIMESTAMP columns as plain "YYYY-MM-DD[ HH:MM:SS]"
      // strings instead of JS Date objects — several repos (reservations,
      // cart) pass these straight into JSX, which can't render a Date.
      dateStrings: true,
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

/**
 * Run a callback inside a transaction on a dedicated connection. Used for
 * multi-statement writes that must be all-or-nothing (checkout: decrement
 * room stock, create the reservation, clear the cart). Returns `null` if the
 * DB isn't configured. If the callback throws, the transaction is rolled
 * back and the error is re-thrown (callers can catch it to distinguish
 * "sold out" from a generic failure) — `null` from this function itself
 * means only "no database configured".
 */
export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T | null> {
  const p = getPool();
  if (!p) return null;
  const conn = await p.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // connection may already be broken — nothing more to do
    }
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Which of these tables don't exist in the current database.
 *
 * The admin panel uses this to say "you haven't imported schema_v6.sql yet"
 * instead of quietly doing nothing. Returns null when the database isn't
 * configured or can't be reached at all — a different problem, worth a
 * different message.
 */
export async function missingTables(names: string[]): Promise<string[] | null> {
  if (names.length === 0) return [];
  const p = getPool();
  if (!p) return null;
  try {
    const placeholders = names.map(() => "?").join(", ");
    const [rows] = await p.query(
      `SELECT table_name AS name FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name IN (${placeholders})`,
      names
    );
    const present = new Set(
      (rows as Array<{ name: string }>).map((r) => r.name.toLowerCase())
    );
    return names.filter((n) => !present.has(n.toLowerCase()));
  } catch (err) {
    console.error("[db] could not inspect tables:", err);
    return null;
  }
}
