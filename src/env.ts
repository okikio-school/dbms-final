import * as dotenv from "dotenv";
dotenv.config();
dotenv.config({
  path: ".env.local",
});

export const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
export const PGPORT = +(process.env.PGPORT ?? 5432);
