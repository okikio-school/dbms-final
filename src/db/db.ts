import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as dotenv from "dotenv";
dotenv.config();
dotenv.config({
    path: ".env.local"
});

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
export const sql = postgres(`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}`);
export const db = drizzle(sql);
