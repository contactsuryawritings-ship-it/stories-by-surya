import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  Btn,
  EmptyState,
  Field,
  Notice,
  Panel,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/ui";
import { moveItem, useDraft } from "@/lib/admin/draft";
import { reindex } from "@/lib/admin/draft";
import type { Film } from "@/lib/content/schema";
import { makeId } from "@/lib/images/optimize";

export const Route = createFileRoute("/admin/films")({
  component: FilmsPage,
});

function normalizeFilmUrl(url: string) {
  const value = url.trim();
  if (!value)
    return { valid: false, platform: "youtube" as const, message: "Add a supported URL." };
  const instagram = value.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p)\//i);
  const youtube = value.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]+)/i,
  );
  if (instagram) return { valid: true, platform: "instagram" as const, message: "Instagram reel" };
  if (youtube) return { valid: true, platform: "youtube" as const, message: "YouTube video" };
  return {
    valid: false,
    platform: "youtube" as const,
    message: "Use a valid Instagram Reel or YouTube URL.",
  };
}

function FilmsPage() {
  const { draft, update } = useDraft();
  const [form, setForm] = useState<Film | null>(null);
  const [error, setError] = useState("");

  const films = useMemo(() => [...draft.films].sort((a, b) => a.order - b.order), [draft.films]);

  function startCreate() {
    setForm({
      id: makeId("film"),
      title: "New film",
      platform: "youtube",
      url: "",
      description: "",
      cover: null,
      published: false,
      order: draft.films.length,
    });
    setError("");
  }

  function editFilm(film: Film) {
    setForm({ ...film });
    setError("");
  }

  function saveFilm() {
    if (!form) return;
    const normalized = normalizeFilmUrl(form.url);
    if (!normalized.valid) {
      setError(normalized.message);
      return;
    }

    const next: Film = {
      ...form,
      platform: normalized.platform,
      url: form.url.trim(),
      title: form.title.trim() || "Untitled film",
    };

    update((current) => {
      const exists = current.films.some((film) => film.id === next.id);
      return {
        ...current,
        films: exists
          ? current.films.map((film) => (film.id === next.id ? next : film))
          : [...current.films, next],
      };
    });
    setForm(null);
    setError("");
  }

  function deleteFilm(id: string) {
    const film = draft.films.find((item) => item.id === id);
    if (!film) return;
    if (!window.confirm(`Delete “${film.title}”?`)) return;
    update((current) => ({ ...current, films: current.films.filter((item) => item.id !== id) }));
    if (form?.id === id) setForm(null);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow opacity-60">Motion</p>
          <h1 className="font-display text-4xl leading-none">Films</h1>
        </div>
        <Btn variant="primary" onClick={startCreate}>
          Create film
        </Btn>
      </header>

      {error ? <Notice tone="error">{error}</Notice> : null}

      {form ? (
        <Panel
          title={form.id ? "Film details" : "New film"}
          description="Instagram Reels and YouTube links only — no uploaded video files."
        >
          <div className="space-y-4">
            <Field label="Title">
              <TextInput
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
              />
            </Field>
            <Field label="Source URL" hint="Use a valid Instagram Reel or YouTube URL.">
              <TextInput
                value={form.url}
                onChange={(value) => setForm({ ...form, url: value })}
                type="url"
              />
            </Field>
            <Field label="Description">
              <TextArea
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                rows={4}
              />
            </Field>
            <div className="flex flex-wrap gap-4">
              <Toggle
                checked={form.published}
                onChange={(value) => setForm({ ...form, published: value })}
                label="Published"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn variant="primary" onClick={saveFilm}>
                Save film
              </Btn>
              <Btn onClick={() => setForm(null)}>Cancel</Btn>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel title="Film library" description="Order, publish and keep each film link valid.">
        {films.length ? (
          <div className="space-y-4">
            {films.map((film, index) => (
              <div
                key={film.id}
                className="flex flex-col gap-4 border border-hairline p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{film.title || "Untitled film"}</p>
                  <p className="text-xs text-muted-foreground">
                    {film.platform === "instagram" ? "Instagram Reel" : "YouTube"}
                  </p>
                  <p className="mt-2 break-all text-xs text-muted-foreground">
                    {film.url || "No link yet"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Btn onClick={() => editFilm(film)}>Edit</Btn>
                  <Btn
                    variant="ghost"
                    onClick={() =>
                      update((current) => ({
                        ...current,
                        films: reindex(moveItem(current.films, index, index - 1)),
                      }))
                    }
                    disabled={index === 0}
                  >
                    ↑
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() =>
                      update((current) => ({
                        ...current,
                        films: reindex(moveItem(current.films, index, index + 1)),
                      }))
                    }
                    disabled={index === films.length - 1}
                  >
                    ↓
                  </Btn>
                  <Btn
                    variant="ghost"
                    onClick={() =>
                      update((current) => ({
                        ...current,
                        films: current.films.map((item) =>
                          item.id === film.id ? { ...item, published: !item.published } : item,
                        ),
                      }))
                    }
                  >
                    {film.published ? "Unpublish" : "Publish"}
                  </Btn>
                  <Btn variant="danger" onClick={() => deleteFilm(film.id)}>
                    Delete
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>
            No films have been added yet. Add a Reel or YouTube link to start the motion section.
          </EmptyState>
        )}
      </Panel>
    </div>
  );
}
