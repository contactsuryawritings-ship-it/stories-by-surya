import { useRef, useState } from "react";

import { Btn, EmptyState, Notice } from "@/components/admin/ui";
import type { ContentImage, Gallery } from "@/lib/content/schema";
import { deleteStoragePath } from "@/lib/content/store";
import { moveItem } from "@/lib/admin/draft";
import { isFirebaseConfigured } from "@/lib/firebase/app";
import { storagePaths } from "@/lib/firebase/config";
import { isAcceptedImage } from "@/lib/images/optimize";
import { uploadPortfolioImage, type UploadProgress } from "@/lib/images/upload";
import { cn } from "@/lib/utils";

/** Bulk upload, selection, ordering and cover management for one gallery. */
export function ImageManager({
  gallery,
  onChange,
}: {
  gallery: Gallery;
  onChange: (recipe: (gallery: Gallery) => Gallery) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadProgress[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");

  const images = gallery.images;

  function toggleSelected(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function setImages(next: (list: ContentImage[]) => ContentImage[]) {
    onChange((current) => ({ ...current, images: next(current.images) }));
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || !fileList.length) return;
    setError("");
    const files = Array.from(fileList);

    const rejected = files.filter((file) => !isAcceptedImage(file));
    if (rejected.length) {
      setError(`${rejected.length} file(s) skipped — only JPEG, PNG, WebP or AVIF are accepted.`);
    }
    const accepted = files.filter(isAcceptedImage);
    if (!accepted.length) return;

    setQueue(accepted.map((file) => ({ fileName: file.name, progress: 0, status: "pending" })));

    for (const file of accepted) {
      const update = (patch: Partial<UploadProgress>) =>
        setQueue((prev) =>
          prev.map((entry) => (entry.fileName === file.name ? { ...entry, ...patch } : entry)),
        );
      try {
        const image = await uploadPortfolioImage(
          file,
          (imageId, ext) => storagePaths.galleryImage(gallery.id, imageId, ext),
          update,
        );
        onChange((current) => ({
          ...current,
          images: [...current.images, image],
          coverImageId: current.coverImageId || image.id,
        }));
      } catch (err) {
        update({
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  async function deleteSelected() {
    const targets = images.filter((image) => selected.includes(image.id));
    setImages((list) => list.filter((image) => !selected.includes(image.id)));
    onChange((current) => ({
      ...current,
      coverImageId: selected.includes(current.coverImageId) ? "" : current.coverImageId,
      sections: current.sections.map((section) => ({
        ...section,
        images: section.images.filter((id) => !selected.includes(id)),
      })),
    }));
    setSelected([]);
    if (isFirebaseConfigured) {
      await Promise.all(
        targets.filter((image) => image.path).map((image) => deleteStoragePath(image.path)),
      );
    }
  }

  const failed = queue.filter((item) => item.status === "error");
  const active = queue.filter((item) => item.status !== "done" && item.status !== "error");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <Btn
          variant="primary"
          disabled={!isFirebaseConfigured}
          onClick={() => inputRef.current?.click()}
          title={isFirebaseConfigured ? "" : "Connect Firebase to upload photographs"}
        >
          Upload photographs
        </Btn>
        <span className="text-xs text-muted-foreground">
          Resized to 2400px and converted to WebP in your browser before upload.
        </span>
      </div>

      {!isFirebaseConfigured ? (
        <div className="mt-4">
          <Notice tone="warn">
            Uploading needs Firebase Storage. Everything else on this screen works without it.
          </Notice>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}

      {queue.length ? (
        <ul className="mt-4 flex flex-col gap-2 border border-hairline p-4">
          {queue.map((item) => (
            <li key={item.fileName} className="text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="truncate">{item.fileName}</span>
                <span className="eyebrow shrink-0 opacity-60">
                  {item.status === "error"
                    ? "Failed"
                    : item.status === "done"
                      ? "Done"
                      : `${item.progress}%`}
                </span>
              </div>
              <div className="mt-1 h-px w-full bg-hairline">
                <div
                  className={cn(
                    "h-px",
                    item.status === "error" ? "bg-destructive" : "bg-foreground",
                  )}
                  style={{ width: `${item.status === "done" ? 100 : item.progress}%` }}
                />
              </div>
              {item.error ? <p className="mt-1 text-xs text-destructive">{item.error}</p> : null}
            </li>
          ))}
          {!active.length ? (
            <li>
              <Btn onClick={() => setQueue([])}>Clear list</Btn>
            </li>
          ) : null}
          {failed.length ? (
            <li className="text-xs text-destructive">
              {failed.length} upload(s) failed. Those photographs were not added.
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="eyebrow opacity-55">
          {images.length} photograph{images.length === 1 ? "" : "s"}
          {selected.length ? ` · ${selected.length} selected` : ""}
        </span>
        {selected.length ? (
          <>
            <Btn
              onClick={() =>
                setImages((list) =>
                  list.map((i) => (selected.includes(i.id) ? { ...i, visible: true } : i)),
                )
              }
            >
              Show
            </Btn>
            <Btn
              onClick={() =>
                setImages((list) =>
                  list.map((i) => (selected.includes(i.id) ? { ...i, visible: false } : i)),
                )
              }
            >
              Hide
            </Btn>
            <Btn variant="danger" onClick={() => void deleteSelected()}>
              Delete
            </Btn>
            <Btn variant="ghost" onClick={() => setSelected([])}>
              Clear selection
            </Btn>
          </>
        ) : null}
      </div>

      {images.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => {
            const isSelected = selected.includes(image.id);
            const isCover = gallery.coverImageId === image.id;
            return (
              <li
                key={image.id}
                className={cn(
                  "border bg-card",
                  isSelected ? "border-foreground" : "border-hairline",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSelected(image.id)}
                  className="block w-full"
                  aria-pressed={isSelected}
                >
                  <span className="relative block" style={{ aspectRatio: "4 / 3" }}>
                    <img
                      src={image.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "h-full w-full object-cover",
                        image.visible ? "" : "opacity-35",
                      )}
                    />
                    {isCover ? (
                      <span className="eyebrow absolute left-2 top-2 bg-foreground px-2 py-1 text-background">
                        Cover
                      </span>
                    ) : null}
                    {!image.visible ? (
                      <span className="eyebrow absolute right-2 top-2 bg-background px-2 py-1">
                        Hidden
                      </span>
                    ) : null}
                  </span>
                </button>
                <div className="flex flex-wrap items-center gap-1 border-t border-hairline p-2">
                  <Btn
                    variant="ghost"
                    onClick={() => onChange((g) => ({ ...g, coverImageId: image.id }))}
                    disabled={isCover}
                  >
                    Cover
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() =>
                      setImages((list) =>
                        list.map((i) => (i.id === image.id ? { ...i, visible: !i.visible } : i)),
                      )
                    }
                  >
                    {image.visible ? "Hide" : "Show"}
                  </Btn>
                  <span className="ml-auto flex gap-1">
                    <Btn
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => setImages((list) => moveItem(list, index, index - 1))}
                      title="Move earlier"
                    >
                      ←
                    </Btn>
                    <Btn
                      variant="ghost"
                      disabled={index === images.length - 1}
                      onClick={() => setImages((list) => moveItem(list, index, index + 1))}
                      title="Move later"
                    >
                      →
                    </Btn>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4">
          <EmptyState>No photographs in this story yet.</EmptyState>
        </div>
      )}
    </div>
  );
}
