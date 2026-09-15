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
  return (
    <div
      className={cn("group relative overflow-hidden bg-muted", className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
      />
    </div>
  );
}
