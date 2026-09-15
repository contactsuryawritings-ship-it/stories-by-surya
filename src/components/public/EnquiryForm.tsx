import { useState } from "react";

import { useContent } from "@/lib/content/useContent";
import { visibleFormFields } from "@/lib/content/selectors";
import { submitEnquiry } from "@/lib/content/store";
import { isFirebaseConfigured } from "@/lib/firebase/app";

export function EnquiryForm() {
  const { content } = useContent();
  const fields = visibleFormFields(content);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  if (!fields.length) return null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: Record<string, string> = {};
    for (const field of fields) values[field.id] = String(data.get(field.id) ?? "");

    setStatus("sending");
    setError("");
    try {
      await submitEnquiry(values);
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Your enquiry could not be sent.");
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <p className="body-lead">
        The enquiry form is not connected yet. Please use the contact details listed.
      </p>
    );
  }

  if (status === "sent") {
    return (
      <p className="display-md" role="status">
        {content.contact.successMessage || "Thank you — your enquiry has been received."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 sm:grid-cols-2">
      {fields.map((field) => {
        const id = `enquiry-${field.id}`;
        const shared =
          "mt-3 w-full border-0 border-b border-hairline bg-transparent pb-3 text-base font-light outline-none transition-colors focus:border-foreground";
        return (
          <div
            key={field.id}
            className={field.type === "textarea" ? "sm:col-span-2" : undefined}
          >
            <label htmlFor={id} className="eyebrow opacity-60">
              {field.label}
              {field.required ? " *" : ""}
            </label>
            {field.type === "textarea" ? (
              <textarea id={id} name={field.id} required={field.required} rows={4} className={shared} />
            ) : field.type === "select" ? (
              <select id={id} name={field.id} required={field.required} className={shared}>
                <option value="">—</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={field.id}
                type={field.type}
                required={field.required}
                className={shared}
              />
            )}
          </div>
        );
      })}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="eyebrow border border-foreground px-10 py-4 transition-colors duration-500 hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {status === "sending" ? "Sending" : "Send enquiry"}
        </button>
        {status === "error" ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
