ALTER TABLE "roles" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role" SET DEFAULT 'driver'::text;--> statement-breakpoint
DROP TYPE "public"."rolesEnum";--> statement-breakpoint
CREATE TYPE "public"."rolesEnum" AS ENUM('admin', 'driver');--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role" SET DEFAULT 'driver'::"public"."rolesEnum";--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "role" SET DATA TYPE "public"."rolesEnum" USING "role"::"public"."rolesEnum";