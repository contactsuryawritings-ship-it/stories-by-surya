import { createFileRoute } from "@tanstack/react-router";

import { GalleryCard } from "@/components/public/GalleryCard";
import { PageIntro, PublicLayout } from "@/components/public/PublicLayout";
import { Reveal } from "@/components/public/Reveal";
import { findCategoryBySlug, galleriesInCategory } from "@/lib/content/selectors";
import { useContent } from "@/lib/content/useContent";

export const Route = createFileRoute("/work/$category")({
  head: ({ params }) => {
    const label = params.category
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${label} — Stories by Surya` },
        { name: "description", content: `${label} photographed by Stories by Surya.` },
        { property: "og:title", content: `${label} — Stories by Surya` },
        { property: "og:description", content: `${label} photographed by Stories by Surya.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category: slug } = Route.useParams();
  const { content, isLoading } = useContent();
  const category = findCategoryBySlug(content, slug);
  const galleries = category ? galleriesInCategory(content, category.id) : [];

  if (!category) {
    return (
      <PublicLayout>
        <PageIntro
          title="Collection unavailable"
          intro={isLoading ? "Loading…" : "This collection is no longer published."}
        />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageIntro eyebrow="Collection" title={category.title} intro={category.description} />
      {galleries.length ? (
        <div className="shell grid gap-16 pb-10 md:grid-cols-2 md:gap-x-8 md:gap-y-28">
          {galleries.map((gallery, index) => (
            <Reveal key={gallery.id} delay={index * 30}>
              <GalleryCard gallery={gallery} index={index} ratio={index % 2 === 0 ? "4 / 5" : "3 / 2"} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="shell body-lead pb-10">Stories from this collection are coming soon.</p>
      )}
    </PublicLayout>
  );
}
