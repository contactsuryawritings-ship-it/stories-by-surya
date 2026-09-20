import { createFileRoute } from "@tanstack/react-router";

import { Btn, Field, Notice, Panel, TextInput, Toggle } from "@/components/admin/ui";
import { useDraft } from "@/lib/admin/draft";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { draft, update, publish, publishing, publishStatus, publishMessage, dirty } = useDraft();

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow opacity-60">Brand</p>
        <h1 className="font-display text-4xl leading-none">Settings</h1>
      </header>

      <Panel
        title="Brand and navigation"
        description="Site-level configuration for the photographer, without exposing developer internals."
      >
        <div className="space-y-4">
          <Field label="Brand name">
            <TextInput
              value={draft.brand.name}
              onChange={(value) =>
                update((current) => ({ ...current, brand: { ...current.brand, name: value } }))
              }
            />
          </Field>
          <Field label="Wordmark">
            <TextInput
              value={draft.brand.wordmark}
              onChange={(value) =>
                update((current) => ({ ...current, brand: { ...current.brand, wordmark: value } }))
              }
            />
          </Field>
          <Field label="Tagline">
            <TextInput
              value={draft.brand.tagline}
              onChange={(value) =>
                update((current) => ({ ...current, brand: { ...current.brand, tagline: value } }))
              }
            />
          </Field>

          <div className="space-y-3">
            <p className="eyebrow opacity-55">Footer</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Copyright">
                <TextInput
                  value={draft.footer.copyright}
                  onChange={(value) =>
                    update((current) => ({
                      ...current,
                      footer: { ...current.footer, copyright: value },
                    }))
                  }
                />
              </Field>
              <Field label="Footer note">
                <TextInput
                  value={draft.footer.note}
                  onChange={(value) =>
                    update((current) => ({
                      ...current,
                      footer: { ...current.footer, note: value },
                    }))
                  }
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-4">
              <Toggle
                checked={draft.footer.showNav}
                onChange={(value) =>
                  update((current) => ({
                    ...current,
                    footer: { ...current.footer, showNav: value },
                  }))
                }
                label="Show navigation"
              />
              <Toggle
                checked={draft.footer.showSocials}
                onChange={(value) =>
                  update((current) => ({
                    ...current,
                    footer: { ...current.footer, showSocials: value },
                  }))
                }
                label="Show socials"
              />
              <Toggle
                checked={draft.footer.showContact}
                onChange={(value) =>
                  update((current) => ({
                    ...current,
                    footer: { ...current.footer, showContact: value },
                  }))
                }
                label="Show contact"
              />
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Public site" description="Publish saved changes when your batch is ready.">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-48 text-sm text-muted-foreground">
            <p>Cache version: {draft.cacheVersion}</p>
            <p>
              {draft.publishedAt
                ? `Last published: ${new Date(draft.publishedAt).toLocaleString()}`
                : "Not published yet"}
            </p>
          </div>
          <Btn variant="primary" onClick={() => void publish()} disabled={dirty || publishing}>
            {publishing ? "Publishing" : "Publish changes"}
          </Btn>
        </div>
        {publishMessage ? (
          <Notice tone={publishStatus === "error" ? "error" : "info"}>
            {publishStatus === "success" ? "✓ " : ""}
            {publishMessage}
          </Notice>
        ) : null}
      </Panel>
    </div>
  );
}
