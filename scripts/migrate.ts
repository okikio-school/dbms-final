import { db } from "@/db/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

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