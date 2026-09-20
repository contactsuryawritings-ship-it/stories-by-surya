import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { ContentImage } from "@/lib/content/schema";

/** Read legacy uploads too: many photographs have no stored dimensions. */
export function usePhotoAspect(image: ContentImage | undefined) {
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const src = image?.src;
  useEffect(() => {
    if (!src) return;
    const photo = new Image();
    photo.onload = () => {
      if (photo.naturalWidth && photo.naturalHeight) {
        const ratio = photo.naturalWidth / photo.naturalHeight;
        setMeasured((current) => (current[src] === ratio ? current : { ...current, [src]: ratio }));
      }
    };
    photo.src = src;
    return () => {
      photo.onload = null;
    };
  }, [src]);
  if (src && measured[src]) return measured[src]!;
  if (image?.width && image.height) return image.width / image.height;
  return image?.orientation === "portrait" ? 2 / 3 : image?.orientation === "square" ? 1 : 3 / 2;
}

/** Preserve the full frame while fitting both the available width and viewport height. */
export function photoFrameStyle(ratio: number): CSSProperties {
  return {
    aspectRatio: ratio,
    width: "100%",
    maxWidth: `min(${ratio * 70}svh, ${ratio * 42}rem)`,
    marginInline: "auto",
  };
}
