"use client";

import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { mutate } from "@/lib/api";

// Flips at once. A failure is toasted by mutate() and flips it back; a success refreshes the page,
// so server-rendered lists like the people you follow catch up.
export function FollowButton({
  handle,
  initialFollowing,
}: {
  handle: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      if (await mutate(next ? "PUT" : "DELETE", `/api/follows/${handle}`)) {
        router.refresh();
      } else {
        setFollowing(!next);
      }
    });
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      onClick={toggle}
      disabled={pending}
      className="shrink-0"
    >
      {following ? (
        <>
          <CheckIcon />
          Following
        </>
      ) : (
        "Follow"
      )}
      <span className="sr-only">, @{handle}</span>
    </Button>
  );
}
