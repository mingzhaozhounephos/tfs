ALTER TABLE "videos" RENAME COLUMN "admin_user_id" TO "admin_user";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_admin_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_admin_user_users_id_fk" FOREIGN KEY ("admin_user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;