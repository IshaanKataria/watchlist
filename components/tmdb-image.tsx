import { cn } from "cn";
import { ImageOffIcon } from "lucide-react";
import Image from "next/image";

type Size = "w185" | "w342" | "w500" | "w1280";

// alt="" because every caller renders the title or name beside it; image-only links name themselves.
export function TmdbImage({
  path,
  size,
  preload,
  className,
}: {
  path: string | null;
  size: Size;
  preload?: boolean;
  className?: string;
}) {
  if (!path) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
        <ImageOffIcon className="size-6" />
      </div>
    );
  }
  return (
    <Image
      src={`https://image.tmdb.org/t/p/${size}${path}`}
      alt=""
      fill
      preload={preload}
      className={cn("object-cover", className)}
    />
  );
}
