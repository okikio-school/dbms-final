import { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } from "@/env.ts";

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const sql = postgres(`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`);
export const db = drizzle(sql, { logger: true });
