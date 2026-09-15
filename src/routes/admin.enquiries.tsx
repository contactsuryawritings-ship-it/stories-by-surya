import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Btn, EmptyState, Panel } from "@/components/admin/ui";
import { enquiryAdapter } from "@/lib/enquiries/adapter";
import type { Enquiry } from "@/lib/content/schema";

export const Route = createFileRoute("/admin/enquiries")({
  component: EnquiriesPage,
});

function EnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    if (!enquiryAdapter.available) {
      setItems([]);
      setSelected(null);
      return;
    }
    try {
      const list = await enquiryAdapter.list();
      setItems(list);
      if (!selected && list[0]) setSelected(list[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load enquiries.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (!enquiryAdapter.available) {
    return (
      <div className="space-y-6">
        <header>
          <p className="eyebrow opacity-60">Inbox</p>
          <h1 className="font-display text-4xl leading-none">Enquiries</h1>
        </header>
        <Panel
          title="Firebase not connected"
          description="The enquiry adapter is unavailable until Firebase is configured."
        >
          <p className="text-sm text-muted-foreground">
            Firebase is not connected. Enquiries will become available after Firebase configuration.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow opacity-60">Inbox</p>
        <h1 className="font-display text-4xl leading-none">Enquiries</h1>
      </header>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Panel
          title="Queue"
          description="Submission time and contact details from the enquiry form."
        >
          {items.length ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className={
                      selected?.id === item.id
                        ? "w-full border border-foreground bg-muted p-3 text-left"
                        : "w-full border border-hairline bg-background p-3 text-left"
                    }
                  >
                    <p className="font-medium">{item.values["name"] || "New enquiry"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No enquiries yet.</EmptyState>
          )}
        </Panel>

        <Panel title="Details" description="Visitor-supplied contact and shoot information.">
          {selected ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="eyebrow opacity-55">Submitted</p>
                  <p className="mt-2 text-sm">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="eyebrow opacity-55">Name</p>
                  <p className="mt-2 text-sm">{selected.values["name"] || "—"}</p>
                </div>
                <div>
                  <p className="eyebrow opacity-55">Email</p>
                  <p className="mt-2 text-sm">{selected.values["email"] || "—"}</p>
                </div>
                <div>
                  <p className="eyebrow opacity-55">Phone</p>
                  <p className="mt-2 text-sm">{selected.values["phone"] || "—"}</p>
                </div>
              </div>

              <div>
                <p className="eyebrow opacity-55">Occasion</p>
                <p className="mt-2 text-sm">{selected.values["occasion"] || "—"}</p>
              </div>
              <div>
                <p className="eyebrow opacity-55">Event date</p>
                <p className="mt-2 text-sm">{selected.values["date"] || "—"}</p>
              </div>
              <div>
                <p className="eyebrow opacity-55">Location</p>
                <p className="mt-2 text-sm">{selected.values["location"] || "—"}</p>
              </div>
              <div>
                <p className="eyebrow opacity-55">Message</p>
                <p className="mt-2 whitespace-pre-line text-sm">
                  {selected.values["message"] || "—"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Btn onClick={() => void refresh()}>Refresh</Btn>
              </div>
            </div>
          ) : (
            <EmptyState>Select an enquiry to read the details.</EmptyState>
          )}
        </Panel>
      </div>
    </div>
  );
}
