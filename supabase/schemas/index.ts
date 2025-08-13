import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  bigint,
  timestamp,
  jsonb,
  pgPolicy
} from 'drizzle-orm/pg-core';
import { crudPolicy } from 'drizzle-orm/neon';
import { authenticatedRole, anonRole } from 'drizzle-orm/supabase';
import { sql } from 'drizzle-orm';

export const rolesEnum = pgEnum('rolesEnum', ['admin', 'driver']);
export const videoActionsEnum = pgEnum('videoActionsEnum', [
  'watched',
  'completed'
]);

const isRole = (role: string) =>
  sql.raw(`EXISTS (
  SELECT 1 FROM roles
  WHERE roles.user_id = auth.uid()
    AND roles.role = '${role}'
)`);

// Users table (define first to avoid reference errors)
export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (t) => [
    crudPolicy({
      read: sql`id = auth.uid()`,
      modify: false,
      role: authenticatedRole
    })
  ]
);

export const roles = pgTable(
  'roles',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: rolesEnum('role').notNull().default('driver')
  },
  (t) => [
    crudPolicy({
      read: sql`user_id = auth.uid()`,
      modify: false,
      role: authenticatedRole
    })
  ]
);

// Optional organisational login
export const organisations = pgTable(
  'organisations',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (t) => [
    crudPolicy({
      // auth.uid() in the organisation_memberships table
      read: sql`(
      select organisation_memberships.user_id = auth.uid()
      from organisation_memberships
      where organisation_memberships.organisation_id = id
    )`,
      modify: false,
      role: authenticatedRole
    })
  ]
);

// Organisation memberships table
export const organisationMemberships = pgTable(
  'organisation_memberships',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull()
  },
  (t) => [
    crudPolicy({
      // can only see members from the same organisation
      read: true,
      modify: false,
      role: authenticatedRole
    })
  ]
);

// uploads table
export const userUploads = pgTable(
  'user_uploads',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    fileUrl: text('file_url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (t) => [
    crudPolicy({
      read: sql`user_id = auth.uid()`,
      modify: false,
      role: authenticatedRole
    })
  ]
);

// videos table
export const videos = pgTable(
  'videos',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    adminUser: uuid('admin_user').references(() => users.id, {
      onDelete: 'cascade'
    }),
    title: text('title'),
    description: text('description'),
    youtubeUrl: text('youtube_url'),
    category: text('category'),
    duration: text('duration'),
    isAnnualRenewal: boolean('is_annual_renewal').default(false)
  },
  (t) => [
    crudPolicy({
      read: true,
      modify: isRole('admin'),
      role: authenticatedRole
    })
  ]
);

// users_videos table
export const usersVideos = pgTable(
  'users_videos',
  {
    id: uuid('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    user: uuid('user').references(() => users.id, { onDelete: 'cascade' }),
    video: uuid('video').references(() => videos.id, { onDelete: 'cascade' }),
    isCompleted: boolean('is_completed').default(false),
    lastWatched: timestamp('last_watched', { withTimezone: true }),
    modifiedDate: timestamp('modified_date', { withTimezone: true }),
    lastAction: videoActionsEnum('last_action'),
    assignedDate: timestamp('assigned_date', { withTimezone: true }),
    completedDate: timestamp('completed_date', { withTimezone: true })
  },
  (t) => [
    crudPolicy({
      read: true,
      modify: sql`EXISTS (
        SELECT 1 FROM roles
        WHERE roles.user_id = auth.uid()
          AND roles.role = 'admin'
      ) OR "user" = auth.uid()`,
      role: authenticatedRole
    })
  ]
);
