import { createFileRoute } from "@tanstack/react-router";

import { EditorialImage } from "@/components/public/EditorialImage";
import { PageIntro, PublicLayout } from "@/components/public/PublicLayout";
import { Reveal } from "@/components/public/Reveal";
import { useContent } from "@/lib/content/useContent";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Stories by Surya" },
      {
        name: "description",
        content:
          "About Stories by Surya — the photographer behind the weddings, portraits and films.",
      },
      { property: "og:title", content: "About — Stories by Surya" },
      {
        property: "og:description",
        content: "The photographer behind Stories by Surya.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { content, isLoading } = useContent();
  const { about } = content;
  const hasBody = Boolean(about.bio || about.secondary || about.portrait || about.stats.length);

  return (
    <PublicLayout>
      <PageIntro eyebrow={about.eyebrow} title={about.heading || "About"} />

      {!hasBody ? (
        <p className="shell body-lead pb-10">
          {isLoading ? "Loading." : "This page is being written."}
        </p>
      ) : (
        <div className="shell grid gap-14 pb-10 md:grid-cols-12 md:gap-20">
          {about.portrait ? (
            <Reveal className="md:col-span-5">
              <EditorialImage image={about.portrait} ratio="4 / 5" priority sizes="(max-width: 768px) 100vw, 40vw" />
            </Reveal>
          ) : null}

          <Reveal className={about.portrait ? "md:col-span-6 md:col-start-7" : "md:col-span-8"}>
            {about.bio ? <p className="body-lead whitespace-pre-line">{about.bio}</p> : null}
            {about.secondary ? (
              <p className="body-lead mt-8 whitespace-pre-line">{about.secondary}</p>
            ) : null}

            {about.stats.length ? (
              <dl className="hairline-t mt-14 grid grid-cols-2 gap-x-8 gap-y-10 pt-10 sm:grid-cols-3">
                {about.stats.map((stat) => (
                  <div key={stat.id}>
                    <dt className="eyebrow opacity-50">{stat.label}</dt>
                    <dd className="display-md mt-3">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Reveal>
        </div>
      )}
    </PublicLayout>
  );
}
