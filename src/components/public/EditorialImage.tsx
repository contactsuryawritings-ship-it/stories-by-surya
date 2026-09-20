import { useState } from "react";

import type { ContentImage } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

/**
 * Photography-first image frame: sharp edges, stable dimensions, gentle scale.
 * Empty alt metadata is handled gracefully (decorative).
 */
export function EditorialImage({
  image,
  className,
  ratio,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  image: ContentImage;
  className?: string;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const intrinsicSize =
    image.width && image.height ? { width: image.width, height: image.height } : naturalSize;
  const hasFixedRatio = Boolean(ratio);

  return (
    <div
      className={cn("group relative bg-muted", className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={image.src}
        alt={image.alt}
        width={intrinsicSize?.width}
        height={intrinsicSize?.height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={(event) => {
          if (intrinsicSize) return;
          const { naturalWidth, naturalHeight } = event.currentTarget;
          if (naturalWidth && naturalHeight)
            setNaturalSize({ width: naturalWidth, height: naturalHeight });
        }}
        className={cn(
          "block w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          hasFixedRatio ? "h-full object-cover group-hover:scale-[1.03]" : "h-auto",
        )}
      />
    </div>
  );
}
