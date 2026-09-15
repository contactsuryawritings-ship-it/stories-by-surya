import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useContent } from "@/lib/content/useContent";
import { visibleNav } from "@/lib/content/selectors";
import { cn } from "@/lib/utils";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { content } = useContent();
  const nav = visibleNav(content);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const light = overlay && !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-700",
          light
            ? "border-b border-transparent text-ivory"
            : "border-b border-hairline bg-background/92 text-foreground backdrop-blur-md",
        )}
      >
        <div className="shell flex h-[76px] items-center justify-between">
          <Link
            to="/"
            className="font-display text-lg leading-none tracking-[0.02em] sm:text-xl"
            onClick={() => setMenuOpen(false)}
          >
            {content.brand.wordmark || content.brand.name}
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
            {nav.map((item) => (
              <Link
                key={item.id}
                to={item.href as never}
                className="eyebrow opacity-70 transition-opacity duration-500 hover:opacity-100"
                activeProps={{ className: "eyebrow opacity-100" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="eyebrow md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="fixed inset-0 z-40 bg-background md:hidden"
      >
        <nav
          aria-label="Mobile"
          className="shell flex h-full flex-col justify-center gap-8 pt-20"
        >
          {nav.map((item) => (
            <Link
              key={item.id}
              to={item.href as never}
              onClick={() => setMenuOpen(false)}
              className="display-md"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
