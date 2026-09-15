import { Link } from "@tanstack/react-router";

import { useContent } from "@/lib/content/useContent";
import { socialHref, visibleNav, visibleSocials } from "@/lib/content/selectors";
import { ContentLink } from "./ContentLink";

export function SiteFooter() {
  const { content } = useContent();
  const nav = visibleNav(content);
  const socials = visibleSocials(content);
  const { footer, contact, brand } = content;
  const year = new Date().getFullYear();

  return (
    <footer className="hairline-t mt-32">
      <div className="shell grid gap-12 py-20 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">{brand.wordmark || brand.name}</p>
          {footer.note ? <p className="body-lead mt-4 max-w-xs">{footer.note}</p> : null}
        </div>

        {footer.showNav && nav.length ? (
          <nav aria-label="Footer" className="flex flex-col gap-3">
            {nav.map((item) => (
              <ContentLink
                key={item.id}
                href={item.href}
                className="eyebrow opacity-70 hover:opacity-100"
              >
                {item.label}
              </ContentLink>
            ))}
          </nav>
        ) : null}

        <div className="flex flex-col gap-3">
          {footer.showContact && contact.email ? (
            <a href={`mailto:${contact.email}`} className="eyebrow opacity-70 hover:opacity-100">
              {contact.email}
            </a>
          ) : null}
          {footer.showContact && contact.phone ? (
            <a href={`tel:${contact.phone}`} className="eyebrow opacity-70 hover:opacity-100">
              {contact.phone}
            </a>
          ) : null}
          {footer.showSocials && socials.length
            ? socials.map((social) => (
                <a
                  key={social.id}
                  href={socialHref(social)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="eyebrow opacity-70 hover:opacity-100"
                  aria-label={`${social.label || social.platform} (opens in a new tab)`}
                >
                  {social.label || social.platform}
                </a>
              ))
            : null}
        </div>
      </div>
      <div className="shell hairline-t flex flex-col gap-2 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="eyebrow opacity-50">
          © {year} {footer.copyright || brand.name}
        </p>
        <Link to="/admin" className="eyebrow opacity-40 hover:opacity-80">
          Studio
        </Link>
      </div>
    </footer>
  );
}
