import * as dotenv from "dotenv";
dotenv.config();
dotenv.config({
  path: ".env.local",
});

export const { 
  PGHOST, PGDATABASE, PGUSER, PGPASSWORD, 
  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
  EMAIL, EMAIL_PASS,
  NEXTAUTH_URL
} = process.env;
export const PGPORT = +(process.env.PGPORT ?? 5432);
