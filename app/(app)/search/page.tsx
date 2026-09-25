import { MovieSearch } from "@/components/movie-search";

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      {/* Keyed so tapping the Search tab on /search?q=… starts a fresh search;
          replaceState while typing never re-renders this page. */}
      <MovieSearch key={initialQuery} initialQuery={initialQuery} />
    </div>
  );
}
