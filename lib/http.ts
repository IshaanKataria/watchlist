import { z } from "zod";

import { getUserId } from "@/lib/supabase/server";

export class ApiError extends Error {
  readonly retryAfter?: number;

  // retryAfter (seconds) becomes a Retry-After header, for 429s.
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    options?: ErrorOptions & { retryAfter?: number },
  ) {
    super(message, options);
    this.retryAfter = options?.retryAfter;
  }
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function errorJson(status: number, code: string, message: string) {
  return json({ error: { code, message } }, status);
}

export function route<Context>(
  handler: (req: Request, ctx: Context) => Promise<Response>,
) {
  return async (req: Request, ctx: Context) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const summary = error.issues
          .map(({ path, message }) =>
            path.length ? `${path.map(String).join(".")}: ${message}` : message,
          )
          .join("; ");
        return errorJson(400, "invalid_request", summary);
      }
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(500, "internal_error", "Something went wrong");
      if (apiError.status >= 500) {
        // eslint-disable-next-line no-console -- server-side failures, and their cause, must reach the logs
        console.error(error);
      }
      const res = errorJson(apiError.status, apiError.code, apiError.message);
      if (apiError.retryAfter) {
        res.headers.set("Retry-After", String(apiError.retryAfter));
      }
      return res;
    }
  };
}

// The proxy matcher excludes /api, so route handlers refresh the session
// themselves: this server client can write the refreshed cookies.
export async function requireUser() {
  const id = await getUserId();
  if (!id) throw new ApiError(401, "unauthorized", "Sign in to continue");
  return { id };
}

// Cross-site requests can't set this header without a CORS preflight, which this app never grants.
export async function parseJson<T extends z.ZodType>(req: Request, schema: T) {
  const type = req.headers.get("content-type")?.split(";")[0]?.trim();
  if (type?.toLowerCase() !== "application/json") {
    throw new ApiError(
      415,
      "unsupported_media_type",
      "Send the body as application/json",
    );
  }
  const body: unknown = await req.json().catch(() => {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON");
  });
  return schema.parse(body);
}

export function parseQuery<T extends z.ZodType>(req: Request, schema: T) {
  return schema.parse(Object.fromEntries(new URL(req.url).searchParams));
}
