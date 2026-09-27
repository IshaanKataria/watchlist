import { z } from "zod";

// Handles are shown as @sam, so a leading @ is dropped: "@sam" finds sam.
export const memberQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .transform((q) => q.replace(/^@/, ""))
    .pipe(z.string().min(1).max(40)),
});
