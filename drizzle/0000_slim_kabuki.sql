DO $$ BEGIN
 CREATE TYPE "asset_type" AS ENUM('photo', 'video', 'file');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "follow_type" AS ENUM('user', 'tag');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "slug_type" AS ENUM('tag', 'post');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "version_type" AS ENUM('post', 'page');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"user_id" text,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"password" varchar NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT account_provider_providerAccountId PRIMARY KEY("provider","providerAccountId"),
	CONSTRAINT "account_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "assets" (
	"assetid" serial PRIMARY KEY NOT NULL,
	"type" "asset_type" NOT NULL,
	"content_path" varchar NOT NULL,
	"file_type" varchar NOT NULL,
	"file_size" numeric(8, 3) NOT NULL,
	"width" numeric(10, 4),
	"height" numeric(10, 4),
	"title" varchar,
	"alt" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments" (
	"comment_id" serial PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"parent_comment" integer,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contentversions" (
	"version_id" serial PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"type" "version_type" NOT NULL,
	"update_at" timestamp NOT NULL,
	"content" json,
	"published_status" boolean NOT NULL,
	"is_featured" boolean NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follows" (
	"follower_id" text NOT NULL,
	"entity_id" text NOT NULL,
	"type" "follow_type" NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT follows_follower_id_entity_id_type PRIMARY KEY("follower_id","entity_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"permission_id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "postassets" (
	"post_id" text NOT NULL,
	"assetid" integer NOT NULL,
	CONSTRAINT postassets_post_id_assetid PRIMARY KEY("post_id","assetid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "postreads" (
	"post_id" text NOT NULL,
	"post_version" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT postreads_post_id_post_version_user_id PRIMARY KEY("post_id","post_version","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"post_id" text PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"userid" text NOT NULL,
	"published_date" timestamp NOT NULL,
	"version" integer,
	CONSTRAINT "posts_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rolepermissions" (
	"permission_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT rolepermissions_permission_id_role_id PRIMARY KEY("permission_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "slugs" (
	"slug_id" serial PRIMARY KEY NOT NULL,
	"entity_id" text NOT NULL,
	"slug" varchar NOT NULL,
	"type" "slug_type" NOT NULL,
	CONSTRAINT "slugs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"tag_id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tagstoposts" (
	"tag_id" text NOT NULL,
	"post_id" text NOT NULL,
	CONSTRAINT tagstoposts_tag_id_post_id PRIMARY KEY("tag_id","post_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userroles" (
	"user_id" text NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT userroles_user_id_role_id PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" text PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"bio" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT verificationToken_identifier_token PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_comments_comment_id_fk" FOREIGN KEY ("parent_comment") REFERENCES "comments"("comment_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contentversions" ADD CONSTRAINT "contentversions_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "postassets" ADD CONSTRAINT "postassets_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "postassets" ADD CONSTRAINT "postassets_assetid_assets_assetid_fk" FOREIGN KEY ("assetid") REFERENCES "assets"("assetid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "postreads" ADD CONSTRAINT "postreads_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "postreads" ADD CONSTRAINT "postreads_post_version_contentversions_version_id_fk" FOREIGN KEY ("post_version") REFERENCES "contentversions"("version_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "postreads" ADD CONSTRAINT "postreads_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_userid_users_user_id_fk" FOREIGN KEY ("userid") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rolepermissions" ADD CONSTRAINT "rolepermissions_permission_id_permissions_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rolepermissions" ADD CONSTRAINT "rolepermissions_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_users_user_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tagstoposts" ADD CONSTRAINT "tagstoposts_tag_id_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tagstoposts" ADD CONSTRAINT "tagstoposts_post_id_posts_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userroles" ADD CONSTRAINT "userroles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userroles" ADD CONSTRAINT "userroles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
