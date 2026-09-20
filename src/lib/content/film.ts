import type { Film } from "./schema";

/** Canonicalize supported links without changing an Instagram post into a reel. */
export function getFilmSource(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "instagram.com") {
    const match = url.pathname.match(/^\/(reel|reels|p)\/([A-Za-z0-9_-]+)\/?$/);
    if (!match) return null;
    const contentType = match[1] === "p" ? ("post" as const) : ("reel" as const);
    return {
      platform: "instagram" as const,
      contentType,
      aspectRatio: contentType === "post" ? ("1:1" as const) : ("9:16" as const),
      embedUrl: `https://www.instagram.com/${contentType === "post" ? "p" : "reel"}/${match[2]}/embed`,
    };
  }
  const youtube = host === "youtube.com" || host === "m.youtube.com";
  const id =
    host === "youtu.be"
      ? url.pathname.slice(1)
      : youtube
        ? url.pathname === "/watch"
          ? url.searchParams.get("v")
          : url.pathname.match(/^\/shorts\/([A-Za-z0-9_-]+)\/?$/)?.[1]
        : null;
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) return null;
  return {
    platform: "youtube" as const,
    contentType: "reel" as const,
    aspectRatio: url.pathname.startsWith("/shorts/") ? ("9:16" as const) : ("16:9" as const),
    embedUrl: `https://www.youtube.com/embed/${id}`,
  };
}

export function filmLabel(film: Pick<Film, "platform" | "contentType">) {
  return film.platform === "instagram"
    ? `Instagram ${film.contentType === "post" ? "Post" : "Reel"}`
    : "YouTube";
}

export function filmAspectRatio(value: Film["aspectRatio"]) {
  return value.replace(":", " / ");
}
