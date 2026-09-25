"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function EmailForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // onSubmit rather than a form action: React resets action forms, which
  // would wipe the email after a failed attempt.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    if (typeof email !== "string" || typeof password !== "string") return;
    startTransition(async () => {
      const { auth } = createClient();
      const { data, error } =
        mode === "sign-in"
          ? await auth.signInWithPassword({ email, password })
          : await auth.signUp({ email, password });
      if (!error && data.session) {
        router.replace("/search");
        return;
      }
      setError(
        error?.message ??
          "Check your inbox to confirm your email, then sign in.",
      );
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 pt-2">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-email`}>Email</Label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-password`}>Password</Label>
        <Input
          id={`${id}-password`}
          name="password"
          type="password"
          autoComplete={
            mode === "sign-in" ? "current-password" : "new-password"
          }
          minLength={6}
          required
          className="h-11"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11">
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}

export function GoogleButton({ oauthFailed }: { oauthFailed: boolean }) {
  const [error, setError] = useState(
    oauthFailed ? "Google sign-in didn't complete. Try again." : null,
  );
  const [pending, startTransition] = useTransition();

  function signIn() {
    setError(null);
    startTransition(async () => {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
    });
  }

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={signIn}
        className="h-11"
      >
        Continue with Google
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
