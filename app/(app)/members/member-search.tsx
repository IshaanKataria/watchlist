"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJson } from "@/lib/api";
import { memberResultSchema } from "@/services/dto";
import { memberQuerySchema } from "@/services/social.schema";

import { MemberList, MemberListSkeleton } from "./member-list";

const responseSchema = z.object({ members: z.array(memberResultSchema) });

function search(q: string, signal: AbortSignal) {
  return getJson(
    `/api/members?${new URLSearchParams({ q })}`,
    responseSchema,
    signal,
  );
}

type Result = { q: string } & Awaited<ReturnType<typeof search>>;

// Shows children (the people you follow) until there is something to search for.
export function MemberSearch({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Parsed as the API parses it, so "@sam" and "sam" are one search and "@" alone is none.
  const q = memberQuerySchema.safeParse({ q: query }).data?.q ?? "";

  useEffect(() => {
    if (!q) return;
    const controller = new AbortController();
    async function load() {
      const found = await search(q, controller.signal);
      if (!controller.signal.aborted) setResult({ q, ...found });
    }
    const timer = setTimeout(() => void load(), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, attempt]);

  function retry() {
    setResult(null);
    setAttempt((n) => n + 1);
  }

  return (
    <div className="grid gap-6">
      <label className="relative">
        <span className="sr-only">Search members</span>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or @handle"
          maxLength={40}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="pl-9"
        />
      </label>
      {q ? <SearchResults q={q} result={result} onRetry={retry} /> : children}
    </div>
  );
}

function SearchResults({
  q,
  result,
  onRetry,
}: {
  q: string;
  result: Result | null;
  onRetry: () => void;
}) {
  // Results for another query never render: a skeleton stands in until the current one answers.
  if (result?.q !== q) return <MemberListSkeleton />;
  if (!result.data) {
    return (
      <div role="alert" className="grid justify-items-start gap-3">
        <p className="text-sm">{result.error}</p>
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }
  if (result.data.members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No members match &ldquo;{q}&rdquo;.
      </p>
    );
  }
  return <MemberList members={result.data.members} />;
}
