import { createFileRoute } from "@tanstack/react-router";

import { Field, Panel, TextInput } from "@/components/admin/ui";
import { useDraft } from "@/lib/admin/draft";

export const Route = createFileRoute("/admin/seo")({
  component: SeoPage,
});

function SeoPage() {
  const { draft, update } = useDraft();

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow opacity-60">Search</p>
        <h1 className="font-display text-4xl leading-none">SEO</h1>
      </header>

      <Panel
        title="Site metadata"
        description="Default search and social metadata for the public site."
      >
        <div className="space-y-4">
          <Field label="Default title">
            <TextInput
              value={draft.seo.title}
              onChange={(value) =>
                update((current) => ({ ...current, seo: { ...current.seo, title: value } }))
              }
            />
          </Field>
          <Field label="Title template">
            <TextInput
              value={draft.seo.titleTemplate}
              onChange={(value) =>
                update((current) => ({ ...current, seo: { ...current.seo, titleTemplate: value } }))
              }
            />
          </Field>
          <Field label="Description">
            <TextInput
              value={draft.seo.description}
              onChange={(value) =>
                update((current) => ({ ...current, seo: { ...current.seo, description: value } }))
              }
            />
          </Field>
          <Field label="Keywords">
            <TextInput
              value={draft.seo.keywords.join(", ")}
              onChange={(value) =>
                update((current) => ({
                  ...current,
                  seo: {
                    ...current.seo,
                    keywords: value
                      .split(",")
                      .map((keyword) => keyword.trim())
                      .filter(Boolean),
                  },
                }))
              }
            />
          </Field>
          <Field label="OG image URL">
            <TextInput
              value={draft.seo.ogImage}
              onChange={(value) =>
                update((current) => ({ ...current, seo: { ...current.seo, ogImage: value } }))
              }
            />
          </Field>
        </div>
      </Panel>
    </div>
  );
}
