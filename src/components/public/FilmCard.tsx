import type { Film } from "@/lib/content/schema";
import { EditorialImage } from "./EditorialImage";

export function FilmCard({ film }: { film: Film }) {
  const embedUrl = getEmbedUrl(film);

  const body = (
    <>
      {embedUrl ? (
        <div className="overflow-hidden bg-onyx" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src={embedUrl}
            title={film.title}
            className="h-full w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : film.cover ? (
        <EditorialImage image={film.cover} ratio="16 / 9" />
      ) : (
        <div className="flex items-center justify-center bg-onyx" style={{ aspectRatio: "16 / 9" }}>
          <span className="eyebrow text-ivory opacity-70">Film</span>
        </div>
      )}
      <div className="mt-5 flex items-baseline justify-between gap-6">
        <h3 className="display-md">{film.title}</h3>
        {film.url ? (
          <span className="eyebrow shrink-0 opacity-60">
            {film.platform === "instagram" ? "Instagram Reel" : "YouTube"}
          </span>
        ) : null}
      </div>
      {film.description ? <p className="body-lead mt-3 max-w-lg">{film.description}</p> : null}
    </>
  );

  return <article className="group">{body}</article>;
}

function getEmbedUrl(film: Film) {
  if (film.platform === "instagram") {
    const match = film.url.match(/instagram\.com\/(?:reel|p)\/([^/?#]+)/i);
    return match ? `https://www.instagram.com/reel/${match[1]}/embed` : null;
  }
  const match = film.url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]+)/i);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}
