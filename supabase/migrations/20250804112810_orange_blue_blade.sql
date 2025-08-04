CREATE TYPE "public"."videoActionsEnum" AS ENUM('watched', 'completed');--> statement-breakpoint
CREATE TABLE "users_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user" uuid,
	"video" uuid,
	"is_completed" boolean DEFAULT false,
	"last_watched" timestamp with time zone,
	"modified_date" timestamp with time zone,
	"last_action" "videoActionsEnum",
	"assigned_date" timestamp with time zone,
	"completed_date" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users_videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"admin_user_id" uuid,
	"title" text,
	"description" text,
	"youtube_url" text,
	"category" text,
	"duration" text,
	"is_annual_renewal" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users_videos" ADD CONSTRAINT "users_videos_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_videos" ADD CONSTRAINT "users_videos_video_videos_id_fk" FOREIGN KEY ("video") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "users_videos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "users_videos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM roles
        WHERE roles.user_id = auth.uid()
          AND roles.role = 'admin'
      ) OR "user" = auth.uid());--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "users_videos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM roles
        WHERE roles.user_id = auth.uid()
          AND roles.role = 'admin'
      ) OR "user" = auth.uid()) WITH CHECK (EXISTS (
        SELECT 1 FROM roles
        WHERE roles.user_id = auth.uid()
          AND roles.role = 'admin'
      ) OR "user" = auth.uid());--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "users_videos" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM roles
        WHERE roles.user_id = auth.uid()
          AND roles.role = 'admin'
      ) OR "user" = auth.uid());--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-select" ON "videos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-insert" ON "videos" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
  SELECT 1 FROM roles
  WHERE roles.user_id = auth.uid()
    AND roles.role = 'admin'
));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-update" ON "videos" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
  SELECT 1 FROM roles
  WHERE roles.user_id = auth.uid()
    AND roles.role = 'admin'
)) WITH CHECK (EXISTS (
  SELECT 1 FROM roles
  WHERE roles.user_id = auth.uid()
    AND roles.role = 'admin'
));--> statement-breakpoint
CREATE POLICY "crud-authenticated-policy-delete" ON "videos" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
  SELECT 1 FROM roles
  WHERE roles.user_id = auth.uid()
    AND roles.role = 'admin'
));