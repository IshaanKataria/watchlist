import { z } from "zod";

const ratingSchema = z.number().int().min(1).max(10);

export const addEntrySchema = z.object({
  tmdbId: z.number().int().positive(),
});

export const updateEntrySchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("watched"), rating: ratingSchema.optional() }),
  z.object({ status: z.literal("to_watch") }),
]);

export type EntryUpdate = z.infer<typeof updateEntrySchema>;
