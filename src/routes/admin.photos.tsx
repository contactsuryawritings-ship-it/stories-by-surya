import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Btn, EmptyState, Notice, Panel, Toggle } from "@/components/admin/ui";
import { moveItem, reindex, useDraft } from "@/lib/admin/draft";
import { deleteStoragePath } from "@/lib/content/store";
import type { ContentImage } from "@/lib/content/schema";
import { storagePaths } from "@/lib/firebase/config";
import { uploadPortfolioImage, type UploadProgress } from "@/lib/images/upload";

export const Route = createFileRoute("/admin/photos")({ component: PhotosPage });

function PhotosPage() {
  const { draft, update, save, canPersist } = useDraft();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});
  const [error, setError] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const photos = [...draft.photos].sort((a, b) => a.order - b.order);

  async function persistPhotos(nextPhotos: ContentImage[]) {
    const next = { ...draft, photos: nextPhotos };
    update(() => next);
    try {
      await save(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photograph changes could not be saved.");
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!canPersist) {
      setError("Firebase is not configured, so photographs cannot be uploaded yet.");
      return;
    }
    setError("");
    let workingDraft = draft;
    for (const file of Array.from(files)) {
      const key = `${file.name}-${file.lastModified}`;
      setUploads((current) => ({
        ...current,
        [key]: { fileName: file.name, progress: 0, status: "pending" },
      }));
      try {
        const image = await uploadPortfolioImage(
          file,
          (imageId, ext) => storagePaths.portfolioImage(imageId, ext),
          (progress) =>
            setUploads((current) => ({
              ...current,
              [key]: { ...current[key], fileName: file.name, ...progress } as UploadProgress,
            })),
        );
        workingDraft = {
          ...workingDraft,
          photos: reindex([...workingDraft.photos, image]),
        };
        update(() => workingDraft);
      } catch (err) {
        setUploads((current) => ({
          ...current,
          [key]: {
            fileName: file.name,
            progress: 0,
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed.",
          },
        }));
        setError(err instanceof Error ? err.message : "Photograph upload failed.");
        break;
      }
    }
    try {
      await save(workingDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photograph changes could not be saved.");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function reorder(fromId: string, toId: string) {
    const from = photos.findIndex((photo) => photo.id === fromId);
    const to = photos.findIndex((photo) => photo.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    void persistPhotos(reindex(moveItem(photos, from, to)));
  }

  function patchPhoto(id: string, changes: Partial<ContentImage>) {
    void persistPhotos(
      draft.photos.map((photo) => (photo.id === id ? { ...photo, ...changes } : photo)),
    );
  }

  function removePhoto(photo: ContentImage) {
    if (!window.confirm("Remove this photograph from the portfolio?")) return;
    void persistPhotos(reindex(draft.photos.filter((item) => item.id !== photo.id)));
    if (photo.path) void deleteStoragePath(photo.path);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow opacity-60">Portfolio</p>
          <h1 className="font-display text-4xl leading-none">Photos</h1>
        </div>
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => void uploadFiles(event.target.files)}
          />
          <Btn variant="primary" onClick={() => inputRef.current?.click()}>
            Upload Photos
          </Btn>
        </>
      </header>

      <p className="max-w-xl text-sm text-muted-foreground">
        One ordered collection powers both the DriftWall and Selected Work. Upload once; the site
        handles the presentation.
      </p>

      {error ? <Notice tone="error">{error}</Notice> : null}

      {Object.values(uploads).length ? (
        <Panel title="Upload progress">
          <div className="space-y-2">
            {Object.values(uploads).map((upload) => (
              <div
                key={upload.fileName}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="truncate">{upload.fileName}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {upload.status === "error"
                    ? upload.error
                    : `${upload.status} ${upload.progress}%`}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel title={`${photos.length} ${photos.length === 1 ? "photograph" : "photographs"}`}>
        {photos.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <article
                key={photo.id}
                draggable
                onDragStart={() => setDraggedId(photo.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedId) reorder(draggedId, photo.id);
                  setDraggedId(null);
                }}
                className="border border-hairline bg-background"
              >
                <a
                  href={photo.src}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[4/5] overflow-hidden bg-muted"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </a>
                <div className="space-y-3 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                    <Toggle
                      checked={photo.visible}
                      onChange={(value) => patchPhoto(photo.id, { visible: value })}
                      label="Visible"
                    />
                  </div>
                  <input
                    className="w-full border-b border-hairline bg-transparent py-2 text-sm outline-none"
                    value={photo.alt}
                    onChange={(event) => patchPhoto(photo.id, { alt: event.target.value })}
                    placeholder="Alt text (optional)"
                    aria-label={`Alt text for photograph ${index + 1}`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Drag to reorder</span>
                    <Btn variant="danger" onClick={() => removePhoto(photo)}>
                      Delete
                    </Btn>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>Upload photographs to build the portfolio.</EmptyState>
        )}
      </Panel>
    </div>
  );
}
