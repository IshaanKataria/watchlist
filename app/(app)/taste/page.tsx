import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { TmdbImage } from "@/components/tmdb-image";
import { WatchlistButton } from "@/components/watchlist-button";
import { requireUserId } from "@/lib/supabase/server";
import { getTasteProfile } from "@/services/taste";
import { MIN_RATED } from "@/services/taste.prompt";

import { GenerateProfile } from "./generate-profile";

type Taste = Awaited<ReturnType<typeof getTasteProfile>>;
type Profile = NonNullable<Taste["profile"]>;

export default async function TastePage() {
  const taste = await getTasteProfile(await requireUserId());

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Taste profile</h1>
      <TasteBody {...taste} />
    </div>
  );
}

function TasteBody({ ratedCount, profile }: Taste) {
  const canGenerate = ratedCount >= MIN_RATED;
  if (!profile && !canGenerate) {
    return (
      <EmptyState href="/watchlist" label="Rate your films">
        Rate at least {MIN_RATED} films to get your taste profile.
      </EmptyState>
    );
  }
  if (!profile) {
    return (
      <GenerateProfile
        label="Write my profile"
        hint="A critic's read on your ratings, and films to watch next."
      />
    );
  }
  const note = profileNote(profile, canGenerate);
  if (note) {
    return (
      <div className="grid gap-8">
        <p className="text-sm text-muted-foreground">{note}</p>
        <ProfileView profile={profile} />
      </div>
    );
  }
  return (
    <GenerateProfile
      label="Regenerate"
      hint="Your list has changed since this profile."
    >
      <ProfileView profile={profile} />
    </GenerateProfile>
  );
}

// Why a saved profile can't be regenerated right now, or null when it can.
function profileNote(profile: Profile, canGenerate: boolean) {
  if (profile.upToDate) {
    return "Up to date with your list. Rate or add a film to refresh it.";
  }
  if (!canGenerate) return `Rate at least ${MIN_RATED} films to refresh it.`;
  if (profile.refreshesIn) {
    return `Your list has changed. You can regenerate ${profile.refreshesIn}.`;
  }
  return null;
}

function ProfileView({ profile }: { profile: Profile }) {
  return (
    <div className="grid gap-8">
      <p className="max-w-prose text-lg leading-relaxed text-pretty">
        {profile.summary}
      </p>
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Watch next</h2>
        <ul className="grid gap-6 md:grid-cols-2">
          {profile.recommendations.map((rec) => (
            <li key={rec.tmdbId} className="flex gap-4">
              {/* The title links to the same page, so the poster stays out of the tab order. */}
              <Link
                href={`/movie/${rec.tmdbId}`}
                aria-hidden
                tabIndex={-1}
                className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                <TmdbImage path={rec.posterPath} size="w185" />
              </Link>
              <div className="grid min-w-0 content-start justify-items-start gap-2">
                <div>
                  <h3 className="leading-snug font-medium">
                    <Link
                      href={`/movie/${rec.tmdbId}`}
                      className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {rec.title}
                    </Link>
                  </h3>
                  {rec.year !== null && (
                    <p className="text-xs text-muted-foreground">{rec.year}</p>
                  )}
                </div>
                <p className="text-sm text-pretty text-muted-foreground">
                  {rec.reason}
                </p>
                <WatchlistButton
                  tmdbId={rec.tmdbId}
                  title={rec.title}
                  initialEntry={rec.entry}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
