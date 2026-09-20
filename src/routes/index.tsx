import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { DriftWall } from "@/components/drift-wall/DriftWall";
import { EditorialImage } from "@/components/public/EditorialImage";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { FilmGallery } from "@/components/public/FilmGallery";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Reveal } from "@/components/public/Reveal";
import { ContentLink } from "@/components/public/ContentLink";
import {
  CircularGallery,
  DepthCarousel,
  MorphSlider,
  RippleDistortion,
} from "@/components/homepage/InteractiveSections";
import {
  driftWallPool,
  publishedFilms,
  socialHref,
  visibleSocials,
  homepagePhotoAllocation,
} from "@/lib/content/selectors";
import { useContent } from "@/lib/content/useContent";
import { prepareImages } from "@/lib/images/preload";

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
  const criticalSources = useMemo(() => {
    const criticalImages = driftWallPool(content);
    const candidates = criticalImages.length
      ? criticalImages.slice(0, Math.min(criticalImages.length, 9))
      : hero.fallbackImage
        ? [hero.fallbackImage]
        : [];
    return [...new Set(candidates.map((image) => image.src))];
  }, [content, hero.fallbackImage]);
  const [prepared, setPrepared] = useState(!criticalSources.length);
  const [visible, setVisible] = useState(!criticalSources.length);
  const [dismissed, setDismissed] = useState(!criticalSources.length);

  useEffect(() => {
    setPrepared(!criticalSources.length);
    setVisible(!criticalSources.length);
    setDismissed(!criticalSources.length);
    let cancelled = false;
    let revealTimer = 0;
    let dismissTimer = 0;
    void prepareImages(criticalSources).then(() => {
      if (!cancelled) {
        setPrepared(true);
        revealTimer = window.setTimeout(() => {
          setVisible(true);
          dismissTimer = window.setTimeout(() => setDismissed(true), 700);
        }, 40);
      }
    });
    return () => {
      cancelled = true;
      window.clearTimeout(revealTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [criticalSources]);

  return (
    <section className="relative flex h-[100dvh] min-h-[560px] items-end overflow-hidden bg-onyx">
      {!dismissed ? (
        <div
          className={`fixed inset-0 z-50 grid place-items-center bg-onyx text-ivory transition-opacity duration-700 ${visible ? "pointer-events-none opacity-0" : "opacity-100"}`}
          aria-live="polite"
        >
          <div className="text-center">
            <p className="font-display text-3xl">{brand.wordmark || brand.name}</p>
            <p className="eyebrow mt-5 opacity-60">Loading the story...</p>
            <div className="mx-auto mt-6 h-px w-24 overflow-hidden bg-ivory/20">
              <div className="h-full w-1/2 animate-[pulse_1.8s_ease-in-out_infinite] bg-ivory/70" />
            </div>
          </div>
        </div>
      ) : null}
      {prepared && pool.length ? (
        <DriftWall
          items={pool}
          speed={hero.driftWall.speed}
          tilt={hero.driftWall.tilt}
          turn={hero.driftWall.turn}
          dim={hero.driftWall.dim}
          grayscale={hero.driftWall.grayscale}
        />
      ) : prepared && hero.fallbackImage ? (
        <>
          <img
            src={hero.fallbackImage.src}
            alt={hero.fallbackImage.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-onyx/45" />
        </>
      ) : prepared ? (
        <div className="absolute inset-0 bg-onyx" />
      ) : null}

      <div className="shell relative z-10 pb-16 text-ivory md:pb-24">
        {hero.eyebrow ? <p className="eyebrow rise-in opacity-70">{hero.eyebrow}</p> : null}
        <h1 className="display-xl rise-in mt-5 max-w-5xl">{hero.title || brand.name}</h1>
        {hero.subtitle ? (
          <p className="rise-in mt-6 max-w-md text-base font-light opacity-80">{hero.subtitle}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap items-center gap-8">
          {hero.ctaLabel && hero.ctaHref ? (
            <ContentLink
              href={hero.ctaHref}
              className="eyebrow border border-ivory/70 px-8 py-4 transition-colors duration-500 hover:bg-ivory hover:text-onyx"
            >
              {hero.ctaLabel}
            </ContentLink>
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
  const allocation = useMemo(() => homepagePhotoAllocation(content), [content]);
  const films = publishedFilms(content);
  const socials = visibleSocials(content);
  const section = (id: "ripple" | "depth" | "morph" | "circular") =>
    content.homepage.sections.find((item) => item.id === id && item.visible);

  const renderPhotoSection = (
    id: "ripple" | "depth" | "morph" | "circular",
    children: ReactNode,
  ) => {
    const config = section(id);
    if (!config) return null;
    const images =
      id === "ripple"
        ? allocation.topPicks
        : id === "depth"
          ? allocation.depthCarousel
          : id === "morph"
            ? allocation.morphSlider
            : allocation.circularGallery;
    if (!images.length) return null;
    return (
      <section id={id} aria-label={config.label || id}>
        <SectionHeading eyebrow={config.eyebrow} heading={config.heading} />
        {children}
      </section>
    );
  };

  return (
    <PublicLayout overlayHeader>
      <Hero />

      <div id="work" className="flex flex-col gap-28 py-28 md:gap-44 md:py-44">
        {renderPhotoSection("ripple", <RippleDistortion items={allocation.topPicks} />)}
        {renderPhotoSection("depth", <DepthCarousel items={allocation.depthCarousel} />)}
        {renderPhotoSection("morph", <MorphSlider items={allocation.morphSlider} />)}
        {renderPhotoSection("circular", <CircularGallery items={allocation.circularGallery} />)}

        <section id="films" aria-label="Films">
          <SectionHeading eyebrow="Films" heading="Moving images, quietly held." />
          <FilmGallery films={films} />
        </section>

        <section id="about" aria-label="About">
          <div className="shell grid items-center gap-12 md:grid-cols-12 md:gap-20">
            {content.about.portrait ? (
              <Reveal className="md:col-span-5">
                <EditorialImage image={content.about.portrait} ratio="4 / 5" />
              </Reveal>
            ) : null}
            <Reveal
              className={content.about.portrait ? "md:col-span-6 md:col-start-7" : "md:col-span-7"}
            >
              {content.about.eyebrow ? (
                <p className="eyebrow opacity-55">{content.about.eyebrow}</p>
              ) : null}
              <h2 className="display-lg mt-5">{content.about.heading || "About"}</h2>
              {content.about.bio ? (
                <p className="body-lead mt-6 max-w-xl">{content.about.bio}</p>
              ) : null}
              {content.about.secondary ? (
                <p className="mt-5 max-w-xl text-sm opacity-70">{content.about.secondary}</p>
              ) : null}
            </Reveal>
          </div>
        </section>

        <section id="contact" aria-label="Contact">
          <div className="shell grid gap-12 md:grid-cols-12 md:gap-20">
            <Reveal className="md:col-span-5">
              {content.contact.eyebrow ? (
                <p className="eyebrow opacity-55">{content.contact.eyebrow}</p>
              ) : null}
              <h2 className="display-lg mt-5">{content.contact.heading || "Contact"}</h2>
              {content.contact.intro ? (
                <p className="body-lead mt-6">{content.contact.intro}</p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3">
                {content.contact.email ? (
                  <a
                    className="eyebrow underline-offset-4 hover:underline"
                    href={`mailto:${content.contact.email}`}
                  >
                    {content.contact.email}
                  </a>
                ) : null}
                {content.contact.phone ? (
                  <a
                    className="eyebrow underline-offset-4 hover:underline"
                    href={`tel:${content.contact.phone}`}
                  >
                    {content.contact.phone}
                  </a>
                ) : null}
                {socials.map((social) => (
                  <a
                    key={social.id}
                    className="eyebrow underline-offset-4 hover:underline"
                    href={socialHref(social)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.label || social.platform} (opens in a new tab)`}
                  >
                    {social.label || social.platform}
                  </a>
                ))}
              </div>
            </Reveal>
            <Reveal className="md:col-span-7">
              <EnquiryForm />
            </Reveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
