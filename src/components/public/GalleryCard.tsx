import { Link } from "@tanstack/react-router";

import { coverImage } from "@/lib/content/selectors";
import type { Gallery } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { EditorialImage } from "./EditorialImage";

export function GalleryCard({
  gallery,
  ratio = "4 / 5",
  index = 0,
  className,
}: {
  gallery: Gallery;
  ratio?: string;
  index?: number;
  className?: string;
}) {
  const cover = coverImage(gallery);
  const meta = [gallery.location, gallery.date].filter(Boolean).join(" · ");

  return (
    <Link
      to="/story/$slug"
      params={{ slug: gallery.slug }}
      className={cn("group block", className)}
    >
      {cover ? (
        <EditorialImage image={cover} ratio={ratio} priority={index === 0} />
      ) : (
        <div className="bg-muted" style={{ aspectRatio: ratio }} />
      )}
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <h3 className="display-md">{gallery.title}</h3>
        <span className="eyebrow shrink-0 opacity-0 transition-opacity duration-500 group-hover:opacity-70">
          View
        </span>
      </div>
      {meta ? <p className="eyebrow mt-2 opacity-50">{meta}</p> : null}
    </Link>
  );
}
