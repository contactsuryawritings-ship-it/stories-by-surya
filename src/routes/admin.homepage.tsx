import { createFileRoute } from "@tanstack/react-router";

import { Field, Panel, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { moveItem, useDraft } from "@/lib/admin/draft";
import { SOCIAL_PLATFORMS } from "@/lib/content/schema";

export const Route = createFileRoute("/admin/homepage")({ component: ContentPage });

function ContentPage() {
  const { draft, update } = useDraft();
  const availablePhotos = draft.photos
    .filter((photo) => photo.visible)
    .sort((a, b) => a.order - b.order);
  const validIds = new Set(availablePhotos.map((photo) => photo.id));
  const selectedTopPicks = [...new Set(draft.homepage.topPickImageIds)]
    .map((id) => availablePhotos.find((photo) => photo.id === id))
    .filter((photo): photo is (typeof availablePhotos)[number] => Boolean(photo));

  function toggleTopPick(id: string) {
    update((current) => {
      const ids = current.homepage.topPickImageIds.filter(
        (item, index, list) => validIds.has(item) && list.indexOf(item) === index,
      );
      const nextIds = ids.includes(id)
        ? ids.filter((item) => item !== id)
        : ids.length < 10
          ? [...ids, id]
          : ids;
      return { ...current, homepage: { ...current.homepage, topPickImageIds: nextIds } };
    });
  }

  function reorderTopPick(from: number, to: number) {
    update((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        topPickImageIds: moveItem(
          selectedTopPicks.map((photo) => photo.id),
          from,
          to,
        ),
      },
    }));
  }

  function toggleHomepageSection(id: "ripple" | "depth" | "morph" | "circular", visible: boolean) {
    update((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        sections: current.homepage.sections.map((section) =>
          section.id === id ? { ...section, visible } : section,
        ),
      },
    }));
  }

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

      <Panel
        title="Homepage Sections"
        description="Photos are shared across all four sections without repeats, starting with one each when you have four photos. Pin up to 10 Top Picks; extra pins appear there as your library grows."
      >
        <div className="space-y-6">
          <div className="grid gap-3 border-b border-hairline pb-6 sm:grid-cols-2 lg:grid-cols-4">
            {(["ripple", "depth", "morph", "circular"] as const).map((id) => {
              const item = draft.homepage.sections.find((section) => section.id === id);
              return (
                <Toggle
                  key={id}
                  checked={item?.visible ?? true}
                  onChange={(value) => toggleHomepageSection(id, value)}
                  label={
                    id === "ripple"
                      ? "Top Picks"
                      : id === "depth"
                        ? "Depth Carousel"
                        : id === "morph"
                          ? "Morph Slider"
                          : "Circular Gallery"
                  }
                />
              );
            })}
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="eyebrow opacity-60">Top Picks</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedTopPicks.length}/10 pinned
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Select from visible photographs below.
              </p>
            </div>
            {selectedTopPicks.length ? (
              <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {selectedTopPicks.map((photo, index) => (
                  <li key={photo.id} className="border border-foreground bg-background p-2">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="aspect-[4/5] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <span className="text-xs">{index + 1}</span>
                      <span className="flex gap-1">
                        <button
                          type="button"
                          className="px-2 py-1 text-sm hover:bg-muted"
                          disabled={index === 0}
                          onClick={() => reorderTopPick(index, index - 1)}
                          aria-label="Move earlier"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-sm hover:bg-muted"
                          disabled={index === selectedTopPicks.length - 1}
                          onClick={() => reorderTopPick(index, index + 1)}
                          aria-label="Move later"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 text-xs hover:bg-muted"
                          onClick={() => toggleTopPick(photo.id)}
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
            {availablePhotos.length ? (
              <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
                {availablePhotos.map((photo) => {
                  const selected = draft.homepage.topPickImageIds.includes(photo.id);
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => toggleTopPick(photo.id)}
                      aria-pressed={selected}
                      aria-label={`${selected ? "Unpin" : "Pin"} ${photo.alt || `photograph ${photo.order + 1}`}`}
                      disabled={!selected && selectedTopPicks.length >= 10}
                      className={`overflow-hidden border text-left disabled:cursor-not-allowed disabled:opacity-30 ${selected ? "border-foreground" : "border-hairline opacity-65 hover:opacity-100"}`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 border border-dashed border-hairline px-4 py-8 text-center text-sm text-muted-foreground">
                Upload and publish photographs to curate Top Picks.
              </p>
            )}
          </div>
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
