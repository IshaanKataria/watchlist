import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Watchlist</h1>
      <Link href="/login">Sign in</Link>
    </main>
  );
}
