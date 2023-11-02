import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
 
export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    host: PGHOST!,
    database: PGDATABASE!,
    user: PGUSER!,
    password: PGPASSWORD!,
    port: 5432,
    ssl: true,
  }
} satisfies Config;