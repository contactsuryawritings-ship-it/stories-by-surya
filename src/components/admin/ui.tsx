import type { ChangeEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Dashboard primitives. Deliberately plain and information-dense — this is the
 * photographer's working tool, not the public site.
 */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string | undefined;
  description?: string | undefined;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section className={cn("border border-hairline bg-card", className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div>
            {title ? <h2 className="font-display text-xl leading-tight">{title}</h2> : null}
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

const controlClass =
  "w-full border border-hairline bg-background px-3 py-2 text-sm font-light outline-none transition-colors focus:border-foreground disabled:opacity-50";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow block opacity-60">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url" | "date" | "number";
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
}) {
  return (
    <input
      type={type}
      className={controlClass}
      value={value}
      placeholder={placeholder ?? ""}
      disabled={disabled ?? false}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string | undefined;
}) {
  return (
    <textarea
      className={controlClass}
      rows={rows}
      value={value}
      placeholder={placeholder ?? ""}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
    />
  );
}

export function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      className={controlClass}
      value={value}
      onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="size-4 accent-foreground"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function Btn({
  children,
  onClick,
  variant = "default",
  disabled,
  type = "button",
  title,
}: {
  children: ReactNode;
  onClick?: (() => void) | undefined;
  variant?: "default" | "primary" | "danger" | "ghost";
  disabled?: boolean | undefined;
  type?: "button" | "submit";
  title?: string | undefined;
}) {
  const styles: Record<string, string> = {
    default: "border border-hairline hover:bg-muted",
    primary: "bg-foreground text-background hover:opacity-90",
    danger: "border border-destructive text-destructive hover:bg-destructive/10",
    ghost: "hover:bg-muted",
  };
  return (
    <button
      type={type}
      title={title ?? ""}
      disabled={disabled ?? false}
      onClick={onClick}
      className={cn(
        "eyebrow px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        styles[variant],
      )}
    >
      {children}
    </button>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    info: "border-hairline bg-muted/60 text-foreground",
    warn: "border-accent bg-accent/40 text-foreground",
    error: "border-destructive bg-destructive/10 text-destructive",
  };
  return (
    <p className={cn("border px-4 py-3 text-sm", tones[tone])} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="border border-dashed border-hairline px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-hairline bg-card px-5 py-6">
      <p className="eyebrow opacity-55">{label}</p>
      <p className="font-display mt-3 text-4xl leading-none">{value}</p>
    </div>
  );
}
