import { createFileRoute, Link } from "@tanstack/react-router";

import { GalleryStory } from "@/components/gallery/GalleryStory";
import { PublicLayout } from "@/components/public/PublicLayout";
import { findGalleryBySlug, publishedGalleries } from "@/lib/content/selectors";
import { useContent } from "@/lib/content/useContent";

export const Route = createFileRoute("/story/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: search["preview"] === "1" || search["preview"] === true ? true : undefined,
  }),
  head: ({ params }) => {
    const label = params.slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${label} — Stories by Surya` },
        { name: "description", content: `A photographic story by Stories by Surya: ${label}.` },
        { property: "og:title", content: `${label} — Stories by Surya` },
        { property: "og:description", content: `A photographic story by Stories by Surya.` },
      ],
    };
  },
  component: StoryPage,
});

function StoryPage() {
  const { slug } = Route.useParams();
  const { preview } = Route.useSearch();
  const { content, isLoading } = useContent();
  const gallery = findGalleryBySlug(content, slug);
  const visible = gallery && (gallery.published || preview);
  const others = publishedGalleries(content).filter((g) => g.slug !== slug).slice(0, 3);

  if (!visible) {
    return (
      <PublicLayout>
        <div className="shell flex min-h-[70vh] flex-col justify-center pt-32">
          <h1 className="display-lg">{isLoading ? "Loading" : "Story unavailable"}</h1>
          {!isLoading ? (
            <p className="body-lead mt-6 max-w-md">
              This story is not published. Browse the current work instead.
            </p>
          ) : null}
          <Link to="/work" className="eyebrow mt-10 inline-block w-fit border-b border-foreground pb-1">
            View all work
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const meta = [gallery.location, gallery.date].filter(Boolean).join(" · ");

  return (
    <PublicLayout>
      <header className="shell pt-[168px] pb-14 md:pb-20">
        {meta ? <p className="eyebrow opacity-55">{meta}</p> : null}
        <h1 className="display-xl mt-5 max-w-4xl">{gallery.title}</h1>
        {gallery.description ? (
          <p className="body-lead mt-8 max-w-xl">{gallery.description}</p>
        ) : null}
      </header>

      <GalleryStory gallery={gallery} />

      {others.length ? (
        <section aria-label="More stories" className="shell mt-32 hairline-t pt-16">
          <p className="eyebrow opacity-55">More stories</p>
          <div className="mt-8 flex flex-col">
            {others.map((other) => (
              <Link
                key={other.id}
                to="/story/$slug"
                params={{ slug: other.slug }}
                className="group flex items-baseline justify-between gap-8 border-b border-hairline py-7"
              >
                <span className="display-md">{other.title}</span>
                <span className="eyebrow shrink-0 opacity-40 group-hover:opacity-90">View</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PublicLayout>
  );
}
