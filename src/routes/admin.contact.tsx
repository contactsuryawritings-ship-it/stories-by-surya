import { createFileRoute } from "@tanstack/react-router";

import { Btn, Field, Panel, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { useDraft } from "@/lib/admin/draft";

export const Route = createFileRoute("/admin/contact")({
  component: ContactPage,
});

function ContactPage() {
  const { draft, update } = useDraft();

  const updateContact = (changes: Partial<typeof draft.contact>) => {
    update((current) => ({ ...current, contact: { ...current.contact, ...changes } }));
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow opacity-60">Connect</p>
        <h1 className="font-display text-4xl leading-none">Contact</h1>
      </header>

      <Panel
        title="Contact details"
        description="Main copy and contact details shown on the public page."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow">
              <TextInput
                value={draft.contact.eyebrow}
                onChange={(value) => updateContact({ eyebrow: value })}
              />
            </Field>
            <Field label="Heading">
              <TextInput
                value={draft.contact.heading}
                onChange={(value) => updateContact({ heading: value })}
              />
            </Field>
          </div>

          <Field label="Intro copy">
            <TextArea
              value={draft.contact.intro}
              rows={4}
              onChange={(value) => updateContact({ intro: value })}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email">
              <TextInput
                value={draft.contact.email}
                onChange={(value) => updateContact({ email: value })}
                type="email"
              />
            </Field>
            <Field label="Phone">
              <TextInput
                value={draft.contact.phone}
                onChange={(value) => updateContact({ phone: value })}
                type="tel"
              />
            </Field>
          </div>

          <Field label="Location">
            <TextInput
              value={draft.contact.location}
              onChange={(value) => updateContact({ location: value })}
            />
          </Field>

          <Field label="Success message">
            <TextInput
              value={draft.contact.successMessage}
              onChange={(value) => updateContact({ successMessage: value })}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Form fields" description="Show or hide the existing enquiry form fields.">
        <div className="space-y-4">
          {draft.contact.fields.length ? (
            draft.contact.fields.map((field) => (
              <div
                key={field.id}
                className="grid gap-3 border border-hairline p-3 md:grid-cols-[1.4fr_1fr_auto] md:items-end"
              >
                <Field label="Label">
                  <TextInput
                    value={field.label}
                    onChange={(value) =>
                      updateContact({
                        fields: draft.contact.fields.map((item) =>
                          item.id === field.id ? { ...item, label: value } : item,
                        ),
                      })
                    }
                  />
                </Field>
                <Field label="Required">
                  <Toggle
                    checked={field.required}
                    onChange={(value) =>
                      updateContact({
                        fields: draft.contact.fields.map((item) =>
                          item.id === field.id ? { ...item, required: value } : item,
                        ),
                      })
                    }
                    label="Required"
                  />
                </Field>
                <Toggle
                  checked={field.visible}
                  onChange={(value) =>
                    updateContact({
                      fields: draft.contact.fields.map((item) =>
                        item.id === field.id ? { ...item, visible: value } : item,
                      ),
                    })
                  }
                  label="Visible"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No fields configured.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}
