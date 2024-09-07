import { sql } from "drizzle-orm";
import {
  pgTableCreator,
  timestamp,
  varchar,
  text,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `RoomSync_${name}`);

export const users = createTable("user", {
  id: text("id").primaryKey().notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const todoLists = createTable("todo_list", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  shortId: varchar("short_id", { length: 10 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
});

export const todoListMembers = createTable("todo_list_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  todoListId: uuid("todo_list_id")
    .notNull()
    .references(() => todoLists.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const todos = createTable("todo", {
  id: uuid("id").defaultRandom().primaryKey(),
  todoListId: uuid("todo_list_id")
    .notNull()
    .references(() => todoLists.id),
  title: varchar("title", { length: 256 }).notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
});
