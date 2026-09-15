import type { ReactNode } from "react";

import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({
  children,
  overlayHeader = false,
}: {
  children: ReactNode;
  overlayHeader?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader overlay={overlayHeader} />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Quiet page opening used by inner pages (no Drift Wall). */
export function PageIntro({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="shell pt-[168px] pb-16 md:pb-24">
      {eyebrow ? <p className="eyebrow opacity-60">{eyebrow}</p> : null}
      <h1 className="display-lg mt-5 max-w-4xl">{title}</h1>
      {intro ? <p className="body-lead mt-6 max-w-xl">{intro}</p> : null}
    </header>
  );
}
