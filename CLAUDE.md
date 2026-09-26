# CLAUDE.md — Watchlist Tracker

Project conventions. Next.js specifics: see `AGENTS.md` and the bundled docs in `node_modules/next/dist/docs/`.

## Commands

- `pnpm dev` · `pnpm check` (typecheck + lint + format:check + unit tests — must be green before any commit)
- `pnpm test` (Vitest unit tests)
- `pnpm db:push` (`supabase db push`) · `pnpm db:types` (regenerate `lib/supabase/database.types.ts`) · `pnpm seed` · `pnpm knip`

## Stack facts (Next 16 — do not use older idioms)

- `proxy.ts`, not `middleware.ts`. `cookies()`, `headers()`, `params`, `searchParams` are async.
- Type pages, layouts and route handlers with the generated `PageProps`, `LayoutProps` and `RouteContext` helpers, not hand-written `Promise` params.
- `pnpm typecheck` runs `next typegen` before `tsc`: `next-env.d.ts` imports route types generated under `.next`.
- `next build` does not lint; CI runs `pnpm check`.
- Tailwind v4: tokens live in `app/globals.css` under `@theme`; there is no `tailwind.config`.
- Supabase via `@supabase/ssr`; follow the current docs (`getClaims()` in the proxy). Regenerate types after every migration.
- AI via Vercel AI SDK 7 (`ai` + `@ai-sdk/anthropic`): `generateText({ instructions, prompt, output: Output.object({ schema }), abortSignal })` with a Zod schema, reading `result.output` inside the try (the getter throws when there is no output). `generateObject` and the `system` option are deprecated. Model id from `process.env.AI_MODEL`.

## Architecture rules

1. The browser Supabase client is for auth only. All data access is server-side in `services/`.
2. Route handler = `route(async (req) => { const user = await requireUser(); const body = await parseJson(req, schema); return json(await service(user.id, body), 200) })`. Nothing else lives in a route file.
3. The user id comes from the session. Never read `userId` / `user_id` from a request body, query or header.
4. No UUIDs leave the server. Members are addressed by `handle`, watchlist entries by `tmdbId`. DTO mappers live in `services/dto.ts`.
5. RLS is enabled on every table; a table without policies is a bug, unless every access goes through security definer functions and its migration says why (`follows`). Migrations are plain SQL in `supabase/migrations/`, one per feature, readable top to bottom.
6. Every external call (TMDB, Anthropic) has a loading state and a visible error state.
7. Server Components by default; `'use client'` only on interactive leaves (search box, rating input, follow button, drawer).
8. Mobile-first: base styles target 375px; add `sm:` / `md:` / `lg:` upward. No fixed pixel widths on layout. Touch targets ≥ 44px. Dialogs become Drawers below `md`.

## Code style (concise beats clever)

- TypeScript strict. No `any`; no `!` or `as` to silence the compiler — fix the type.
- Zod schemas are the single source of truth: `type X = z.infer<typeof xSchema>`. Validate at the boundary once; trust types inside.
- Comments explain _why_, never _what_. No commented-out code, no `console.log`, no TODO without an owner.
- No abstraction before the third use. No utility file for one function. No wrapper components that only pass props through.
- Files < 200 lines, components < 150. When exceeded, split by responsibility, not by line count.
- Named exports, except Next route/page/layout files. Early returns over nesting. `async/await` over `.then`.
- Platform first: `fetch`, `Intl`, `URLSearchParams`, `crypto`. No new dependency without asking.
- Touch only the files the current task needs. Unrelated cleanups are their own commits.
- Delete rather than deprecate. The simplest implementation that passes the acceptance criteria wins.

## Errors

- Services throw `ApiError(status, code, message)`; `route()` maps `ApiError` and `ZodError` to `{ error: { code, message } }` with the right status. Unknown errors → 500 with a generic message, logged server-side.
- UI: `error.tsx` per route group, toast on failed mutations, explicit empty states. Never swallow an error silently.

## Definition of done

`pnpm check` green · acceptance criteria met at 375px and on desktop · loading, empty and error states present · no new dependencies.
