import { toast } from "sonner";
import { z } from "zod";

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

// Sends a mutation to the app's own API. Failures are toasted with the server's
// message, so callers only handle success.
export async function mutate(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  if (res?.ok) return true;
  const error = errorSchema.safeParse(await res?.json().catch(() => null));
  toast.error(
    error.data?.error.message ?? "Couldn't reach the server. Try again.",
  );
  return false;
}
