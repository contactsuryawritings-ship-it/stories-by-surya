/**
 * Browser-side image optimisation: validate, resize to a sensible portfolio
 * long edge, and re-encode to WebP before uploading to Firebase Storage.
 */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const DEFAULT_LONG_EDGE = 2400;
export const DEFAULT_QUALITY = 0.86;

export type OptimizedImage = {
  blob: Blob;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "square";
  extension: "webp";
};

export function isAcceptedImage(file: File) {
  return ACCEPTED_TYPES.includes(file.type);
}

export async function optimizeImage(
  file: File,
  longEdge = DEFAULT_LONG_EDGE,
  quality = DEFAULT_QUALITY,
): Promise<OptimizedImage> {
  if (!isAcceptedImage(file)) {
    throw new Error(`${file.name}: unsupported format`);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, longEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(`${file.name}: could not process image`);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  if (!blob) throw new Error(`${file.name}: could not encode image`);

  return {
    blob,
    width,
    height,
    orientation: width === height ? "square" : width > height ? "landscape" : "portrait",
    extension: "webp",
  };
}

export function makeImageId() {
  return `img_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
