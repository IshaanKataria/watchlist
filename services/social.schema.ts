import { z } from "zod";

// Handles are shown as @sam, so a leading @ is dropped: "@sam" finds sam.
export const memberQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .transform((q) => q.replace(/^@/, ""))
    .pipe(z.string().min(1).max(40)),
});

// The cursor is the last row's watched_at, passed back exactly as Postgres wrote it: a Date would
// drop the microseconds and skip rows at the page edge.
export const feedQuerySchema = z.object({
  before: z.iso.datetime({ offset: true }).optional(),
});
