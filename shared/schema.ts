import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the beatTitles table for storage
export const beatTitles = pgTable("beatTitles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  key: text("key"),
  scale: text("scale"),
  bpm: integer("bpm"),
  collaborator: text("collaborator"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Define the favorites table for storage
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  key: text("key"),
  scale: text("scale"),
  bpm: integer("bpm"),
  collaborator: text("collaborator"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schemas
export const insertBeatTitleSchema = createInsertSchema(beatTitles).omit({
  id: true,
  createdAt: true
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true
});

// Types
export type InsertBeatTitle = z.infer<typeof insertBeatTitleSchema>;
export type BeatTitle = typeof beatTitles.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Konstanten für Metadaten-Optionen
export const KEYS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export const SCALES = [
  "Maj", "Min"
];

export const DEFAULT_METADATA = {
  key: "D",  // Wird in der Anzeige zu "d" (Kleinbuchstaben)
  scale: "Min", // Standardmäßig "Min" wie gefordert
  bpm: 130,  // Standardmäßig 130 wie gefordert
  collaborator: "@fgybeats" // Standardmäßig @fgybeats wie gefordert
};
