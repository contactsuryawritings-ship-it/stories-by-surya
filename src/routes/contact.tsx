import { createFileRoute } from "@tanstack/react-router";

import { EnquiryForm } from "@/components/public/EnquiryForm";
import { PageIntro, PublicLayout } from "@/components/public/PublicLayout";
import { Reveal } from "@/components/public/Reveal";
import { visibleSocials } from "@/lib/content/selectors";
import { useContent } from "@/lib/content/useContent";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Stories by Surya" },
      {
        name: "description",
        content: "Enquire about wedding, pre-wedding and portrait photography with Stories by Surya.",
      },
      { property: "og:title", content: "Contact — Stories by Surya" },
      {
        property: "og:description",
        content: "Enquire about photography with Stories by Surya.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { content } = useContent();
  const { contact } = content;
  const socials = visibleSocials(content);

  return (
    <PublicLayout>
      <PageIntro
        eyebrow={contact.eyebrow}
        title={contact.heading || "Contact"}
        intro={contact.intro}
      />

      <div className="shell grid gap-14 pb-10 md:grid-cols-12 md:gap-20">
        <Reveal className="md:col-span-4">
          <dl className="flex flex-col gap-8">
            {contact.email ? (
              <div>
                <dt className="eyebrow opacity-50">Email</dt>
                <dd className="mt-3">
                  <a href={`mailto:${contact.email}`} className="text-lg font-light">
                    {contact.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.phone ? (
              <div>
                <dt className="eyebrow opacity-50">Phone</dt>
                <dd className="mt-3">
                  <a href={`tel:${contact.phone}`} className="text-lg font-light">
                    {contact.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.location ? (
              <div>
                <dt className="eyebrow opacity-50">Based in</dt>
                <dd className="mt-3 text-lg font-light">{contact.location}</dd>
              </div>
            ) : null}
            {socials.length ? (
              <div>
                <dt className="eyebrow opacity-50">Elsewhere</dt>
                <dd className="mt-3 flex flex-col gap-2">
                  {socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-lg font-light"
                    >
                      {social.label || social.platform}
                    </a>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </Reveal>

        <Reveal className="md:col-span-7 md:col-start-6">
          <EnquiryForm />
        </Reveal>
      </div>
    </PublicLayout>
  );
}
