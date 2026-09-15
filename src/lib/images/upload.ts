import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { getFirebaseStorage } from "../firebase/app";
import { optimizeImage, makeImageId, DEFAULT_LONG_EDGE } from "./optimize";
import type { ContentImage } from "../content/schema";

export type UploadProgress = {
  fileName: string;
  progress: number;
  status: "pending" | "optimizing" | "uploading" | "done" | "error";
  error?: string;
};

/**
 * Optimise + upload one file. Failures are isolated per file so a batch never
 * dies as a whole, and no metadata is produced for a failed upload.
 */
export async function uploadPortfolioImage(
  file: File,
  storagePath: (imageId: string, ext: string) => string,
  onProgress: (update: Partial<UploadProgress>) => void,
  longEdge = DEFAULT_LONG_EDGE,
): Promise<ContentImage> {
  onProgress({ status: "optimizing", progress: 0 });
  const optimized = await optimizeImage(file, longEdge);

  const imageId = makeImageId();
  const path = storagePath(imageId, optimized.extension);
  const task = uploadBytesResumable(ref(getFirebaseStorage(), path), optimized.blob, {
    contentType: "image/webp",
    cacheControl: "public,max-age=31536000,immutable",
  });

  onProgress({ status: "uploading", progress: 0 });

  await new Promise<void>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const pct = snapshot.totalBytes
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress({ status: "uploading", progress: pct });
      },
      reject,
      () => resolve(),
    );
  });

  const src = await getDownloadURL(task.snapshot.ref);
  onProgress({ status: "done", progress: 100 });

  return {
    id: imageId,
    src,
    path,
    alt: "",
    width: optimized.width,
    height: optimized.height,
    orientation: optimized.orientation,
    visible: true,
  };
}
