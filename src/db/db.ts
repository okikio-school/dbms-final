//define connection with database
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as dotenv from "dotenv";
dotenv.config();
 
neonConfig.fetchConnectionCache = true;

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
export const sql = neon(`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}`);
export const db = drizzle(sql);
 
// const result = await db.select().from(...);