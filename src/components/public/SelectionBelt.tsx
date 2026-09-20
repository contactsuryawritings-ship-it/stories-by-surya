import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/components/drift-wall/useReducedMotion";

export function SelectionBelt({
  index,
  label,
  children,
}: {
  index: number;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const belt = ref.current;
    const selected = belt?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!belt || !selected) return;
    const outer = belt.getBoundingClientRect();
    const inner = selected.getBoundingClientRect();
    if (inner.left < outer.left || inner.right > outer.right) {
      belt.scrollTo({
        left: belt.scrollLeft + inner.left - outer.left - (outer.width - inner.width) / 2,
        behavior: reduced ? "instant" : "smooth",
      });
    }
  }, [index, reduced]);
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className="flex gap-2 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:thin]"
    >
      {children}
    </div>
  );
}
