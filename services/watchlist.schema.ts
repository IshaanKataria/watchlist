import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
});

// TMDB ids key integer columns.
const tmdbIdSchema = z.int32().positive();

// Route params arrive as strings. Digits only: coercion would also accept 1e3 or 0x3E8
// and answer for one film at many URLs.
export const tmdbIdParamSchema = z
  .string()
  .regex(/^[1-9]\d*$/, "Expected a TMDB id")
  .transform(Number)
  .pipe(tmdbIdSchema);

export const addEntrySchema = z.object({ tmdbId: tmdbIdSchema });

export const updateEntrySchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("watched"),
    rating: z.number().int().min(1).max(10).optional(),
  }),
  z.object({ status: z.literal("to_watch") }),
]);

export type EntryUpdate = z.infer<typeof updateEntrySchema>;
