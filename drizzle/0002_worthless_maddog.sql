ALTER TABLE "account" DROP CONSTRAINT "account_user_id_unique";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET NOT NULL;