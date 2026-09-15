import { createFileRoute, Link } from "@tanstack/react-router";

import { GalleryCard } from "@/components/public/GalleryCard";
import { PageIntro, PublicLayout } from "@/components/public/PublicLayout";
import { Reveal } from "@/components/public/Reveal";
import { categoriesWithWork, publishedGalleries } from "@/lib/content/selectors";
import { useContent } from "@/lib/content/useContent";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Work — Stories by Surya" },
      {
        name: "description",
        content: "Photographic stories by Stories by Surya: weddings, pre-weddings and portraits.",
      },
      { property: "og:title", content: "Work — Stories by Surya" },
      {
        property: "og:description",
        content: "Photographic stories: weddings, pre-weddings and portraits.",
      },
    ],
  }),
  component: WorkIndex,
});

function WorkIndex() {
  const { content } = useContent();
  const galleries = publishedGalleries(content);
  const categories = categoriesWithWork(content);

  return (
    <PublicLayout>
      <PageIntro eyebrow="Portfolio" title="Work" />

      {categories.length ? (
        <nav aria-label="Collections" className="shell mb-16 flex flex-wrap gap-x-8 gap-y-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/work/$category"
              params={{ category: category.slug }}
              className="eyebrow opacity-60 hover:opacity-100"
            >
              {category.title}
            </Link>
          ))}
        </nav>
      ) : null}

      {galleries.length ? (
        <div className="shell grid gap-16 pb-10 md:grid-cols-2 md:gap-x-8 md:gap-y-28">
          {galleries.map((gallery, index) => (
            <Reveal
              key={gallery.id}
              delay={index * 30}
              className={index % 3 === 0 ? "md:col-span-2" : undefined}
            >
              <GalleryCard
                gallery={gallery}
                index={index}
                ratio={index % 3 === 0 ? "16 / 9" : "4 / 5"}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="shell body-lead pb-10">New work is being prepared.</p>
      )}
    </PublicLayout>
  );
}
