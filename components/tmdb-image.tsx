import { cn } from "cn";
import { ImageOffIcon } from "lucide-react";
import Image from "next/image";

type Size = "w185" | "w342" | "w500" | "w1280";

// Fills its positioned parent. Every TMDB image sits beside the title or name
// it shows, so the alt text stays empty rather than repeating it.
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
