"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mutate } from "@/lib/api";
import type { MemberDto } from "@/services/dto";

// The inputs mirror the server's rules, so the browser catches most mistakes; a taken or
// reserved handle comes back from the server as a toast.
export function SettingsForm({ me }: { me: MemberDto }) {
  const router = useRouter();
  const id = useId();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    startTransition(async () => {
      if (await mutate("PATCH", "/api/me", body)) {
        toast.success("Profile saved");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-name`}>Display name</Label>
        <Input
          id={`${id}-name`}
          name="displayName"
          defaultValue={me.displayName}
          autoComplete="name"
          maxLength={40}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-handle`}>Handle</Label>
        <Input
          id={`${id}-handle`}
          name="handle"
          defaultValue={me.handle}
          pattern="[a-z0-9_]{3,20}"
          maxLength={20}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={`${id}-handle-hint`}
          required
        />
        <p id={`${id}-handle-hint`} className="text-xs text-muted-foreground">
          3–20 lowercase letters, numbers or underscores. People find you by it,
          and you keep your followers when it changes.
        </p>
      </div>
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
