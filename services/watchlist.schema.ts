import { z } from "zod";

import { tmdbIdSchema } from "@/lib/tmdb";

export const addEntrySchema = z.object({ tmdbId: tmdbIdSchema });

export const updateEntrySchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("watched"),
    rating: z.number().int().min(1).max(10).optional(),
  }),
  z.object({ status: z.literal("to_watch") }),
]);

export type EntryUpdate = z.infer<typeof updateEntrySchema>;
