import { createFileRoute } from "@tanstack/react-router";

import { Btn, Field, Panel, TextArea, TextInput } from "@/components/admin/ui";
import { useDraft } from "@/lib/admin/draft";

export const Route = createFileRoute("/admin/about")({
  component: AboutPage,
});

function AboutPage() {
  const { draft, update } = useDraft();

  const updateAbout = (changes: Partial<typeof draft.about>) => {
    update((current) => ({ ...current, about: { ...current.about, ...changes } }));
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow opacity-60">Profile</p>
        <h1 className="font-display text-4xl leading-none">About</h1>
      </header>

      <Panel
        title="About content"
        description="Edit the existing schema fields without inventing new biography sections."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow">
              <TextInput
                value={draft.about.eyebrow}
                onChange={(value) => updateAbout({ eyebrow: value })}
              />
            </Field>
            <Field label="Heading">
              <TextInput
                value={draft.about.heading}
                onChange={(value) => updateAbout({ heading: value })}
              />
            </Field>
          </div>

          <Field label="Main biography">
            <TextArea
              value={draft.about.bio}
              rows={6}
              onChange={(value) => updateAbout({ bio: value })}
            />
          </Field>

          <Field label="Secondary copy">
            <TextArea
              value={draft.about.secondary}
              rows={5}
              onChange={(value) => updateAbout({ secondary: value })}
            />
          </Field>

          <Field label="Portrait image URL">
            <TextInput
              value={draft.about.portrait?.src ?? ""}
              onChange={(value) =>
                updateAbout({
                  portrait: value
                    ? {
                        ...((draft.about.portrait ?? {
                          id: "about-portrait",
                          src: value,
                          path: "",
                          alt: "",
                          width: 1200,
                          height: 1500,
                          orientation: "portrait",
                          visible: true,
                        }) as NonNullable<typeof draft.about.portrait>),
                        src: value,
                      }
                    : null,
                })
              }
            />
          </Field>

          <div className="space-y-3">
            <p className="eyebrow opacity-55">Stats</p>
            {draft.about.stats.length ? (
              draft.about.stats.map((stat) => (
                <div key={stat.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <Field label="Label">
                    <TextInput
                      value={stat.label}
                      onChange={(value) =>
                        updateAbout({
                          stats: draft.about.stats.map((item) =>
                            item.id === stat.id ? { ...item, label: value } : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Value">
                    <TextInput
                      value={stat.value}
                      onChange={(value) =>
                        updateAbout({
                          stats: draft.about.stats.map((item) =>
                            item.id === stat.id ? { ...item, value } : item,
                          ),
                        })
                      }
                    />
                  </Field>
                  <Btn
                    variant="danger"
                    onClick={() =>
                      updateAbout({
                        stats: draft.about.stats.filter((item) => item.id !== stat.id),
                      })
                    }
                  >
                    Remove
                  </Btn>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No stats yet.</p>
            )}
            <Btn
              onClick={() =>
                updateAbout({
                  stats: [...draft.about.stats, { id: `stat_${Date.now()}`, label: "", value: "" }],
                })
              }
            >
              Add stat
            </Btn>
          </div>
        </div>
      </Panel>
    </div>
  );
}
