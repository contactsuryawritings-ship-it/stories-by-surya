import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route } from "../../src/routes/admin.films";
import { DraftProvider, useDraft } from "../../src/lib/admin/draft";
import { FilmCard } from "../../src/components/public/FilmCard";
import { parseContent } from "../../src/lib/content/schema";
import "../../src/styles.css";

const queryClient = new QueryClient();
queryClient.setQueryData(["site-content"], {
  source: "remote",
  content: parseContent({
    brand: {},
    hero: {},
    homepage: {},
    about: {},
    contact: {},
    seo: {},
    footer: {},
    films: [
      {
        id: "post",
        title: "Existing post",
        url: "https://instagram.com/p/oldpost/",
        platform: "instagram",
        published: true,
      },
      {
        id: "reel",
        title: "Existing reel",
        url: "https://instagram.com/reel/oldreel/",
        platform: "instagram",
        published: true,
      },
    ],
  }),
});
const FilmsPage = Route.options.component!;
export function Preview() {
  const { draft } = useDraft();
  return (
    <div aria-label="Public preview" className="mt-12 grid items-start gap-6 md:grid-cols-2">
      {draft.films
        .filter((film) => film.published)
        .map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <DraftProvider>
      <FilmsPage />
      <Preview />
    </DraftProvider>
  </QueryClientProvider>,
);
