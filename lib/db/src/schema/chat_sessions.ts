import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chatSessionsTable = pgTable("chat_sessions", {
  id: text("id").primaryKey(),
  messages: jsonb("messages").notNull().default([]),
  session_data: jsonb("session_data").notNull().default({}),
  lang: text("lang").notNull().default("fr"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertChatSessionSchema = createInsertSchema(
  chatSessionsTable,
).omit({
  created_at: true,
  updated_at: true,
});
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessionsTable.$inferSelect;
