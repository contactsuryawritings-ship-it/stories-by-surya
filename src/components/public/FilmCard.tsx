import type { Film } from "@/lib/content/schema";
import { EditorialImage } from "./EditorialImage";

export function FilmCard({ film }: { film: Film }) {
  const label = film.platform === "instagram" ? "Watch on Instagram" : "Watch on YouTube";

  const body = (
    <>
      {film.cover ? (
        <EditorialImage image={film.cover} ratio="16 / 9" />
      ) : (
        <div className="flex items-center justify-center bg-onyx" style={{ aspectRatio: "16 / 9" }}>
          <span className="eyebrow text-ivory opacity-70">Film</span>
        </div>
      )}
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <h3 className="display-md">{film.title}</h3>
        {film.url ? <span className="eyebrow shrink-0 opacity-60">{label}</span> : null}
      </div>
      {film.description ? <p className="body-lead mt-3 max-w-lg">{film.description}</p> : null}
    </>
  );

  if (!film.url) return <article className="group">{body}</article>;

  return (
    <a
      className="group block"
      href={film.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${film.title} — ${label}`}
    >
      {body}
    </a>
  );
}
