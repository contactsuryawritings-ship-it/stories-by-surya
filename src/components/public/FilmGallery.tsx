import { useState } from "react";
import type { Film } from "@/lib/content/schema";
import { filmLabel } from "@/lib/content/film";
import { AspectStage } from "./AspectStage";
import { FilmDetails, FilmMedia } from "./FilmCard";
import { SelectionBelt } from "./SelectionBelt";

export function FilmGallery({ films }: { films: Film[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (!films.length) return null;
  const index = Math.max(
    0,
    films.findIndex((film) => film.id === selectedId),
  );
  const film = films[index]!;
  const [width, height] = film.aspectRatio.split(":").map(Number);
  const move = (step: number) =>
    setSelectedId(films[(index + step + films.length) % films.length]!.id);
  return (
    <div
      className="shell"
      role="region"
      aria-label="Films and posts"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <article>
        <div className="h-[min(65svh,42rem)] overflow-hidden bg-onyx p-3 md:p-5">
          <AspectStage ratio={width! / height!}>
            <FilmMedia key={film.id} film={film} />
          </AspectStage>
        </div>
        <FilmDetails film={film} />
      </article>
      <div className="my-4 flex items-center justify-between gap-4">
        <p className="eyebrow" aria-live="polite">
          {index + 1} / {films.length}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous reel or post"
            onClick={() => move(-1)}
            disabled={films.length < 2}
            className="grid size-11 place-items-center border border-current/30 disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next reel or post"
            onClick={() => move(1)}
            disabled={films.length < 2}
            className="grid size-11 place-items-center border border-current/30 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
      <SelectionBelt index={index} label="Choose a reel or post">
        {films.map((item, itemIndex) => (
          <button
            type="button"
            key={item.id}
            aria-label={`Show ${item.title}`}
            aria-current={itemIndex === index}
            onClick={() => setSelectedId(item.id)}
            className={`flex h-24 w-48 shrink-0 items-center gap-3 border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${itemIndex === index ? "border-foreground bg-muted" : "border-hairline hover:bg-muted/50"}`}
          >
            {item.cover ? (
              <img
                src={item.cover.src}
                alt=""
                className="h-16 w-12 shrink-0 object-contain"
                loading="lazy"
              />
            ) : (
              <span className="font-display text-2xl opacity-50">
                {String(itemIndex + 1).padStart(2, "0")}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider opacity-60">
                {filmLabel(item)}
              </span>
              <span className="mt-1 line-clamp-2 block text-sm">{item.title}</span>
            </span>
          </button>
        ))}
      </SelectionBelt>
    </div>
  );
}
