import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  Btn,
  EmptyState,
  Field,
  Notice,
  Panel,
  SelectInput,
  TextArea,
  TextInput,
  Toggle,
} from "@/components/admin/ui";
import { moveItem, useDraft } from "@/lib/admin/draft";
import { reindex } from "@/lib/admin/draft";
import { FILM_ASPECT_RATIOS, type Film } from "@/lib/content/schema";
import { filmLabel, getFilmSource } from "@/lib/content/film";
import { makeId } from "@/lib/images/optimize";

export const Route = createFileRoute("/admin/films")({
  component: FilmsPage,
});

function FilmsPage() {
  const { draft, update } = useDraft();
  const [form, setForm] = useState<Film | null>(null);
  const [error, setError] = useState("");

  const films = useMemo(() => [...draft.films].sort((a, b) => a.order - b.order), [draft.films]);

  function startCreate() {
    setForm({
      id: makeId("film"),
      title: "New film",
      platform: "instagram",
      contentType: "reel",
      aspectRatio: "9:16",
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
    const normalized = getFilmSource(form.url);
    if (!normalized) {
      setError("Use a valid Instagram Reel, Instagram Post, or YouTube URL.");
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
          description="Add an Instagram Reel, Instagram Post, or YouTube link."
        >
          <div className="space-y-4">
            <Field label="Title">
              <TextInput
                value={form.title}
                onChange={(value) => setForm({ ...form, title: value })}
              />
            </Field>
            <Field label="Source URL" hint="Use an Instagram Reel, Instagram Post, or YouTube URL.">
              <TextInput
                value={form.url}
                onChange={(value) => {
                  const source = getFilmSource(value);
                  const previous = getFilmSource(form.url);
                  const changedSource =
                    source &&
                    (!previous ||
                      source.platform !== previous.platform ||
                      source.contentType !== previous.contentType ||
                      source.aspectRatio !== previous.aspectRatio);
                  setForm({
                    ...form,
                    url: value,
                    ...(changedSource
                      ? {
                          platform: source.platform,
                          contentType: source.contentType,
                          aspectRatio: source.aspectRatio,
                        }
                      : {}),
                  });
                }}
                type="url"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Reel or Post">
                <SelectInput
                  value={form.contentType}
                  onChange={(contentType) => setForm({ ...form, contentType })}
                  options={[
                    { value: "reel", label: "Reel" },
                    { value: "post", label: "Post" },
                  ]}
                />
              </Field>
              <Field
                label="Aspect ratio"
                hint="Choose the proportions of the original post or reel."
              >
                <SelectInput
                  value={form.aspectRatio}
                  onChange={(aspectRatio) => setForm({ ...form, aspectRatio })}
                  options={FILM_ASPECT_RATIOS.map((value) => ({
                    value,
                    label: `${value}${value === "9:16" ? " — Vertical" : value === "1:1" ? " — Square" : value === "4:5" || value === "3:4" ? " — Portrait" : " — Landscape"}`,
                  }))}
                />
              </Field>
            </div>
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
                    {filmLabel(film)} · {film.aspectRatio}
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
            No films have been added yet. Add an Instagram Reel, Post, or YouTube link.
          </EmptyState>
        )}
      </Panel>
    </div>
  );
}
