import { MovieSearch } from "@/components/movie-search";

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const { q } = await searchParams;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
      <MovieSearch initialQuery={typeof q === "string" ? q : ""} />
    </div>
  );
}
