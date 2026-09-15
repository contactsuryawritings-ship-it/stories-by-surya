import { createFileRoute, Link } from "@tanstack/react-router";

import { DriftWall } from "@/components/drift-wall/DriftWall";
import { EditorialImage } from "@/components/public/EditorialImage";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { FilmCard } from "@/components/public/FilmCard";
import { GalleryCard } from "@/components/public/GalleryCard";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Reveal } from "@/components/public/Reveal";
import {
  categoriesWithWork,
  driftWallPool,
  featuredGalleries,
  homepageSections,
  publishedFilms,
} from "@/lib/content/selectors";
import { useContent } from "@/lib/content/useContent";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stories by Surya — Wedding & Editorial Photography" },
      {
        name: "description",
        content:
          "Stories by Surya is a photography studio composing weddings, portraits and films as quiet, cinematic stories.",
      },
      { property: "og:title", content: "Stories by Surya — Wedding & Editorial Photography" },
      {
        property: "og:description",
        content: "Weddings, portraits and films photographed as cinematic stories.",
      },
    ],
  }),
  component: Home,
});

function Hero() {
  const { content } = useContent();
  const pool = driftWallPool(content);
  const { hero, brand } = content;

  return (
    <section className="relative flex h-[100dvh] min-h-[560px] items-end overflow-hidden bg-onyx">
      {pool.length ? (
        <DriftWall
          items={pool}
          speed={hero.driftWall.speed}
          tilt={hero.driftWall.tilt}
          turn={hero.driftWall.turn}
          dim={hero.driftWall.dim}
          grayscale={hero.driftWall.grayscale}
        />
      ) : hero.fallbackImage ? (
        <>
          <img
            src={hero.fallbackImage.src}
            alt={hero.fallbackImage.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-onyx/45" />
        </>
      ) : (
        <div className="absolute inset-0 bg-onyx" />
      )}

      <div className="shell relative z-10 pb-16 text-ivory md:pb-24">
        {hero.eyebrow ? <p className="eyebrow rise-in opacity-70">{hero.eyebrow}</p> : null}
        <h1 className="display-xl rise-in mt-5 max-w-5xl">{hero.title || brand.name}</h1>
        {hero.subtitle ? (
          <p className="rise-in mt-6 max-w-md text-base font-light opacity-80">{hero.subtitle}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center gap-8">
          {hero.ctaLabel && hero.ctaHref ? (
            <Link
              to={hero.ctaHref as never}
              className="eyebrow border border-ivory/70 px-8 py-4 transition-colors duration-500 hover:bg-ivory hover:text-onyx"
            >
              {hero.ctaLabel}
            </Link>
          ) : null}
          {hero.scrollLabel ? (
            <span className="eyebrow opacity-60">{hero.scrollLabel} ↓</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, heading }: { eyebrow?: string; heading?: string }) {
  if (!eyebrow && !heading) return null;
  return (
    <Reveal className="shell mb-12 md:mb-20">
      {eyebrow ? <p className="eyebrow opacity-55">{eyebrow}</p> : null}
      {heading ? <h2 className="display-lg mt-5 max-w-3xl">{heading}</h2> : null}
    </Reveal>
  );
}

function Home() {
  const { content } = useContent();
  const sections = homepageSections(content);
  const featured = featuredGalleries(content);
  const categories = categoriesWithWork(content);
  const films = publishedFilms(content);

  return (
    <PublicLayout overlayHeader>
      <Hero />

      <div className="flex flex-col gap-28 py-28 md:gap-44 md:py-44">
        {sections.map((section) => {
          if (section.id === "featured") {
            if (!featured.length) return null;
            return (
              <section key={section.id} aria-label={section.label || "Featured stories"}>
                <SectionHeading eyebrow={section.eyebrow} heading={section.heading || section.label} />
                <div className="shell grid gap-16 md:grid-cols-12 md:gap-y-32">
                  {featured.map((gallery, index) => {
                    const layout =
                      index % 3 === 0
                        ? "md:col-span-12"
                        : index % 3 === 1
                          ? "md:col-span-7"
                          : "md:col-span-5 md:mt-24";
                    return (
                      <Reveal key={gallery.id} className={layout} delay={index * 40}>
                        <GalleryCard
                          gallery={gallery}
                          index={index}
                          ratio={index % 3 === 0 ? "16 / 9" : index % 3 === 1 ? "3 / 2" : "4 / 5"}
                        />
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            );
          }

          if (section.id === "categories") {
            if (!categories.length) return null;
            return (
              <section key={section.id} aria-label={section.label || "Collections"}>
                <SectionHeading eyebrow={section.eyebrow} heading={section.heading || section.label} />
                <div className="shell hairline-t">
                  {categories.map((category, index) => (
                    <Reveal key={category.id} delay={index * 40}>
                      <Link
                        to="/work/$category"
                        params={{ category: category.slug }}
                        className="group flex items-baseline justify-between gap-8 border-b border-hairline py-8 md:py-12"
                      >
                        <span className="display-md">{category.title}</span>
                        {category.description ? (
                          <span className="body-lead hidden max-w-sm md:block">
                            {category.description}
                          </span>
                        ) : null}
                        <span className="eyebrow shrink-0 opacity-40 transition-opacity duration-500 group-hover:opacity-90">
                          View
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          }

          if (section.id === "films") {
            if (!films.length) return null;
            return (
              <section key={section.id} aria-label={section.label || "Films"}>
                <SectionHeading eyebrow={section.eyebrow} heading={section.heading || section.label} />
                <div className="shell grid gap-16 md:grid-cols-2">
                  {films.slice(0, 2).map((film, index) => (
                    <Reveal key={film.id} delay={index * 40}>
                      <FilmCard film={film} />
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          }

          if (section.id === "about") {
            const preview = content.homepage.aboutPreview || content.about.bio;
            if (!preview && !content.about.portrait) return null;
            return (
              <section key={section.id} aria-label={section.label || "About"}>
                <div className="shell grid items-center gap-12 md:grid-cols-12 md:gap-20">
                  {content.about.portrait ? (
                    <Reveal className="md:col-span-5">
                      <EditorialImage image={content.about.portrait} ratio="4 / 5" />
                    </Reveal>
                  ) : null}
                  <Reveal className="md:col-span-6 md:col-start-7">
                    {section.eyebrow ? (
                      <p className="eyebrow opacity-55">{section.eyebrow}</p>
                    ) : null}
                    {section.heading || content.about.heading ? (
                      <h2 className="display-lg mt-5">{section.heading || content.about.heading}</h2>
                    ) : null}
                    {preview ? <p className="body-lead mt-6 max-w-xl">{preview}</p> : null}
                    <Link to="/about" className="eyebrow mt-10 inline-block border-b border-foreground pb-1">
                      Read more
                    </Link>
                  </Reveal>
                </div>
              </section>
            );
          }

          if (section.id === "contact") {
            return (
              <section key={section.id} aria-label={section.label || "Enquire"}>
                <div className="shell grid gap-12 md:grid-cols-12 md:gap-20">
                  <Reveal className="md:col-span-5">
                    {section.eyebrow ? (
                      <p className="eyebrow opacity-55">{section.eyebrow}</p>
                    ) : null}
                    <h2 className="display-lg mt-5">
                      {content.homepage.contactHeading || section.heading || "Enquire"}
                    </h2>
                    {content.homepage.contactBody ? (
                      <p className="body-lead mt-6">{content.homepage.contactBody}</p>
                    ) : null}
                  </Reveal>
                  <Reveal className="md:col-span-7">
                    <EnquiryForm />
                  </Reveal>
                </div>
              </section>
            );
          }

          return null;
        })}
      </div>
    </PublicLayout>
  );
}
