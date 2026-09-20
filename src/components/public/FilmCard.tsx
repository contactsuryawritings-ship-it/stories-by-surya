import type { Film } from "@/lib/content/schema";
import { filmAspectRatio, filmLabel, getFilmSource } from "@/lib/content/film";

export function FilmMedia({ film }: { film: Film }) {
  const embedUrl = getFilmSource(film.url)?.embedUrl;
  if (embedUrl)
    return (
      <iframe
        src={embedUrl}
        title={film.title}
        className="h-full w-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    );
  if (film.cover)
    return (
      <img
        src={film.cover.src}
        alt={film.cover.alt}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    );
  return (
    <div className="flex h-full items-center justify-center bg-onyx">
      <span className="eyebrow text-ivory opacity-70">
        {film.contentType === "post" ? "Post" : "Reel"}
      </span>
    </div>
  );
}

export function FilmDetails({ film }: { film: Film }) {
  return (
    <>
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="display-md">{film.title}</h3>
        {film.url ? <span className="eyebrow shrink-0 opacity-60">{filmLabel(film)}</span> : null}
      </div>
      {film.description ? <p className="body-lead mt-3 max-w-lg">{film.description}</p> : null}
    </>
  );
}

export function FilmCard({ film }: { film: Film }) {
  return (
    <article className="group">
      <div
        className="overflow-hidden bg-onyx"
        style={{ aspectRatio: filmAspectRatio(film.aspectRatio) }}
      >
        <FilmMedia film={film} />
      </div>
      <FilmDetails film={film} />
    </article>
  );
}
