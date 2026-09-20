export type ImagePreparation = {
  ready: boolean;
  loaded: number;
  total: number;
};

const PRELOAD_TIMEOUT_MS = 4500;

export function uniqueImageSources(sources: readonly string[]): string[] {
  return [...new Set(sources.filter(Boolean))];
}

export function prepareImages(
  sources: readonly string[],
  onProgress?: (progress: ImagePreparation) => void,
  timeoutMs = PRELOAD_TIMEOUT_MS,
): Promise<ImagePreparation> {
  const uniqueSources = uniqueImageSources(sources);
  if (!uniqueSources.length) return Promise.resolve({ ready: true, loaded: 0, total: 0 });

  return new Promise((resolve) => {
    let loaded = 0;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve({ ready: true, loaded, total: uniqueSources.length });
    };
    const markLoaded = () => {
      loaded += 1;
      onProgress?.({ ready: false, loaded, total: uniqueSources.length });
      if (loaded >= uniqueSources.length) finish();
    };
    const timeout = window.setTimeout(finish, timeoutMs);

    for (const source of uniqueSources) {
      const image = new Image();
      image.onload = () => {
        const decoded = image.decode?.();
        if (decoded) {
          void decoded.catch(() => undefined).finally(markLoaded);
        } else {
          markLoaded();
        }
      };
      image.onerror = markLoaded;
      image.src = source;
    }
  });
}
