import { createFileRoute } from "@tanstack/react-router";

import { Field, Panel, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { useDraft } from "@/lib/admin/draft";
import { SOCIAL_PLATFORMS } from "@/lib/content/schema";

export const Route = createFileRoute("/admin/homepage")({ component: ContentPage });

function ContentPage() {
  const { draft, update } = useDraft();

  function updateSocial(
    platform: (typeof SOCIAL_PLATFORMS)[number],
    changes: { label?: string; url?: string; visible?: boolean },
  ) {
    update((current) => {
      const existing = current.socials.find((social) => social.platform === platform);
      const next = {
        id: existing?.id ?? `social-${platform}`,
        platform,
        label: existing?.label ?? platform.charAt(0).toUpperCase() + platform.slice(1),
        url: existing?.url ?? "",
        visible: existing?.visible ?? true,
        ...changes,
      };
      return {
        ...current,
        socials: existing
          ? current.socials.map((social) => (social.id === existing.id ? next : social))
          : [...current.socials, next],
      };
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow opacity-60">Homepage</p>
        <h1 className="font-display text-4xl leading-none">Content</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Keep the words simple. The site handles the presentation automatically.
        </p>
      </header>

      <Panel title="Hero" description="The opening words over the DriftWall.">
        <div className="space-y-4">
          <Field label="Eyebrow">
            <TextInput
              value={draft.hero.eyebrow}
              onChange={(value) =>
                update((current) => ({ ...current, hero: { ...current.hero, eyebrow: value } }))
              }
            />
          </Field>
          <Field label="Title">
            <TextInput
              value={draft.hero.title}
              onChange={(value) =>
                update((current) => ({ ...current, hero: { ...current.hero, title: value } }))
              }
            />
          </Field>
          <Field label="Subtitle">
            <TextArea
              rows={3}
              value={draft.hero.subtitle}
              onChange={(value) =>
                update((current) => ({ ...current, hero: { ...current.hero, subtitle: value } }))
              }
            />
          </Field>
          <Field label="CTA label">
            <TextInput
              value={draft.hero.ctaLabel}
              onChange={(value) =>
                update((current) => ({
                  ...current,
                  hero: { ...current.hero, ctaLabel: value, ctaHref: value ? "#work" : "" },
                }))
              }
            />
          </Field>
        </div>
      </Panel>

      <Panel title="About" description="A portrait and a short introduction on the homepage.">
        <div className="space-y-4">
          <Field label="Heading">
            <TextInput
              value={draft.about.heading}
              onChange={(value) =>
                update((current) => ({ ...current, about: { ...current.about, heading: value } }))
              }
            />
          </Field>
          <Field label="Biography">
            <TextArea
              rows={6}
              value={draft.about.bio}
              onChange={(value) =>
                update((current) => ({ ...current, about: { ...current.about, bio: value } }))
              }
            />
          </Field>
          <Field label="Secondary text">
            <TextArea
              rows={4}
              value={draft.about.secondary}
              onChange={(value) =>
                update((current) => ({ ...current, about: { ...current.about, secondary: value } }))
              }
            />
          </Field>
          <Field label="Portrait image URL">
            <TextInput
              type="url"
              value={draft.about.portrait?.src ?? ""}
              onChange={(value) =>
                update((current) => ({
                  ...current,
                  about: {
                    ...current.about,
                    portrait: value
                      ? {
                          ...(current.about.portrait ?? {
                            id: "about-portrait",
                            src: value,
                            path: "",
                            alt: "",
                            width: 1200,
                            height: 1500,
                            orientation: "portrait" as const,
                            visible: true,
                            order: 0,
                          }),
                          src: value,
                        }
                      : null,
                  },
                }))
              }
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Contact" description="Direct contact details shown on the homepage.">
        <div className="space-y-4">
          <Field label="Heading">
            <TextInput
              value={draft.contact.heading}
              onChange={(value) =>
                update((current) => ({
                  ...current,
                  contact: { ...current.contact, heading: value },
                }))
              }
            />
          </Field>
          <Field label="Supporting copy">
            <TextArea
              rows={4}
              value={draft.contact.intro}
              onChange={(value) =>
                update((current) => ({ ...current, contact: { ...current.contact, intro: value } }))
              }
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email">
              <TextInput
                type="email"
                value={draft.contact.email}
                onChange={(value) =>
                  update((current) => ({
                    ...current,
                    contact: { ...current.contact, email: value },
                  }))
                }
              />
            </Field>
            <Field label="Phone">
              <TextInput
                value={draft.contact.phone}
                onChange={(value) =>
                  update((current) => ({
                    ...current,
                    contact: { ...current.contact, phone: value },
                  }))
                }
              />
            </Field>
          </div>
          <div className="space-y-5 border-t border-hairline pt-5">
            <div>
              <p className="eyebrow opacity-60">Social accounts</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add only the accounts you want visitors to see. WhatsApp accepts a number or a wa.me
                URL.
              </p>
            </div>
            {SOCIAL_PLATFORMS.map((platform) => {
              const social = draft.socials.find((item) => item.platform === platform);
              return (
                <div
                  key={platform}
                  className="grid gap-3 md:grid-cols-[0.7fr_1.5fr_auto] md:items-end"
                >
                  <Field label="Platform">
                    <TextInput
                      value={social?.label ?? platform.charAt(0).toUpperCase() + platform.slice(1)}
                      onChange={(value) => updateSocial(platform, { label: value })}
                    />
                  </Field>
                  <Field label={platform === "whatsapp" ? "Number or URL" : "URL"}>
                    <TextInput
                      value={social?.url ?? ""}
                      onChange={(value) => updateSocial(platform, { url: value })}
                      type={platform === "whatsapp" ? "text" : "url"}
                      placeholder={
                        platform === "whatsapp" ? "+91 98765 43210" : `https://${platform}.com/...`
                      }
                    />
                  </Field>
                  <Toggle
                    checked={social?.visible ?? true}
                    onChange={(value) => updateSocial(platform, { visible: value })}
                    label="Visible"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </div>
  );
}
