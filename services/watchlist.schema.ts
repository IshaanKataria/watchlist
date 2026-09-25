import { z } from "zod";

import { Constants } from "@/lib/supabase/database.types";

const ratingSchema = z.number().int().min(1).max(10);

export const addEntrySchema = z.object({
  tmdbId: z.number().int().positive(),
});

export const updateEntrySchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("watched"), rating: ratingSchema.optional() }),
  z.object({ status: z.literal("to_watch") }),
]);

export type EntryUpdate = z.infer<typeof updateEntrySchema>;

// A schema rather than a bare type: the search box parses API responses with it.
export const entryStateSchema = z.object({
  status: z.enum(Constants.public.Enums.watch_status),
  rating: ratingSchema.nullable(),
});

export type EntryState = z.infer<typeof entryStateSchema>;
