//define connection with database
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from "dotenv";
import { migrate } from 'drizzle-orm/neon-http/migrator';
dotenv.config();
 
neonConfig.fetchConnectionCache = true;

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
export const sql = neon(`postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}`);
export const db = drizzle(sql);

//migrate:push - pushes to Neon
async function main() {
    console.log("migration started...");
    await migrate(db, {migrationsFolder:"drizzle"});
    console.log("migration ended");
    process.exit(0);
}

//catch errors
main().catch((err) => {
    console.log(err);
    process.exit(0);
});

// const result = await db.select().from(...);