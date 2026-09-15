import { createFileRoute } from "@tanstack/react-router";

import { FilmCard } from "@/components/public/FilmCard";
import { PageIntro, PublicLayout } from "@/components/public/PublicLayout";
import { Reveal } from "@/components/public/Reveal";
import { publishedFilms, homepageSections } from "@/lib/content/selectors";
import { useContent } from "@/lib/content/useContent";

export const Route = createFileRoute("/films")({
  head: () => ({
    meta: [
      { title: "Films — Stories by Surya" },
      {
        name: "description",
        content: "Wedding and portrait films by Stories by Surya, on Instagram and YouTube.",
      },
      { property: "og:title", content: "Films — Stories by Surya" },
      {
        property: "og:description",
        content: "Wedding and portrait films by Stories by Surya.",
      },
    ],
  }),
  component: FilmsPage,
});

function FilmsPage() {
  const { content, isLoading } = useContent();
  const films = publishedFilms(content);
  const section = homepageSections(content).find((s) => s.id === "films");

  return (
    <PublicLayout>
      <PageIntro
        eyebrow={section?.eyebrow ?? ""}
        title={section?.heading || section?.label || "Films"}
      />

      {films.length ? (
        <div className="shell grid gap-16 pb-10 md:grid-cols-2 md:gap-x-8 md:gap-y-28">
          {films.map((film, index) => (
            <Reveal key={film.id} delay={index * 30}>
              <FilmCard film={film} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="shell body-lead pb-10">{isLoading ? "Loading." : "Films are on their way."}</p>
      )}
    </PublicLayout>
  );
}
