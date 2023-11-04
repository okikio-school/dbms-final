import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";
//import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.development" });

try {
    let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
    const sql = neon(`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}`);
    const db = drizzle(sql);
} catch (error) {
    console.log(error);
}

//https://anasrin.vercel.app/blog/seeding-database-with-drizzle-orm/
