import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Navigation targets in the content model are plain strings edited by the
 * photographer. This resolves them to type-safe router links where the path is
 * a real route, and to a normal anchor otherwise — no unsafe casts.
 */
const INTERNAL = ["/", "/work", "/about", "/films", "/contact"] as const;

type InternalPath = (typeof INTERNAL)[number];

function asInternal(href: string): InternalPath | null {
  const trimmed = href.trim().replace(/\/+$/, "") || "/";
  return (INTERNAL as readonly string[]).includes(trimmed) ? (trimmed as InternalPath) : null;
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
  const internal = asInternal(href);

  if (internal) {
    return (
      <Link
        to={internal}
        className={className}
        onClick={onClick}
        {...(activeClassName ? { activeProps: { className: activeClassName } } : {})}
      >
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
