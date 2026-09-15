import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Navigation targets in the content model are plain strings edited by the
 * photographer. This resolves them to type-safe router links where the path is
 * a real route, and to a normal anchor otherwise — no unsafe casts.
 */
const LEGACY_ANCHORS = {
  "/work": "/#work",
  "/films": "/#films",
  "/about": "/#about",
  "/contact": "/#contact",
} as const;

function asAnchor(href: string) {
  const trimmed = href.trim();
  if (trimmed.startsWith("#")) return `/${trimmed}`;
  return LEGACY_ANCHORS[trimmed as keyof typeof LEGACY_ANCHORS] ?? null;
}

export function ContentLink({
  href,
  className,
  children,
  onClick,
  activeClassName,
}: {
  href: string;
  className?: string | undefined;
  children: ReactNode;
  onClick?: (() => void) | undefined;
  activeClassName?: string | undefined;
}) {
  const anchor = asAnchor(href);

  if (anchor) {
    return (
      <a href={anchor} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  if (href.trim() === "/") {
    return (
      <Link to="/" className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const external = /^(https?:|mailto:|tel:)/i.test(href);
  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {children}
    </a>
  );
}
