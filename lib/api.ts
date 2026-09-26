import { toast } from "sonner";
import { z } from "zod";

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

// The server's { error: { message } }, or a fallback when the request never got an answer.
export function errorMessage(body: unknown) {
  return (
    errorSchema.safeParse(body).data?.error.message ??
    "Couldn't reach the server. Try again."
  );
}

// Failures are toasted with the server's message, so callers only handle success.
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
  toast.error(errorMessage(await res?.json().catch(() => null)));
  return false;
}
