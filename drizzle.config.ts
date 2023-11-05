import type { Config } from "drizzle-kit";
import { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } from "./src/env.ts";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    host: PGHOST!,
    database: PGDATABASE!,
    user: PGUSER!,
    password: PGPASSWORD!,
    port: PGPORT!,
    ssl: false,
  }
} satisfies Config;