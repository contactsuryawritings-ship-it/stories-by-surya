import { useEffect, useMemo, useRef } from "react";

import type { ContentImage } from "@/lib/content/schema";
import { useReducedMotion, useWallBreakpoint } from "./useReducedMotion";

/**
 * Drift Wall — a continuous wall of photographs moving slowly through 3D space.
 * Deterministic tile distribution (no hydration drift), automatic repetition so
 * the wall is always completely filled, and overscan so no gap is ever visible.
 */

export type DriftWallProps = {
  items: ContentImage[];
  speed?: number;
  tilt?: number;
  turn?: number;
  dim?: number;
  grayscale?: boolean;
  parallax?: number;
  overlayColor?: string;
};

/** Deterministic hash so server and client agree on every tile. */
function pick(index: number, length: number) {
  const h = Math.imul(index ^ 0x9e3779b9, 0x85ebca6b);
  return Math.abs((h ^ (h >>> 15)) % length);
}

function variance(index: number) {
  const h = Math.imul(index + 17, 2654435761);
  return ((h >>> 8) % 1000) / 1000;
}

const CONFIG = {
  mobile: { columns: 3, tileHeight: 200, rows: 8, gap: 6 },
  tablet: { columns: 4, tileHeight: 190, rows: 8, gap: 8 },
  desktop: { columns: 6, tileHeight: 180, rows: 9, gap: 8 },
} as const;

export function DriftWall({
  items,
  speed = 26,
  tilt = 12,
  turn = -10,
  dim = 0.45,
  grayscale = false,
  parallax = 0.35,
}: DriftWallProps) {
  const reduced = useReducedMotion();
  const bp = useWallBreakpoint();
  const cfg = CONFIG[bp];
  const stageRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => {
    if (!items.length) return [];
    const total = cfg.columns * cfg.rows;
    // Repeat and interleave the pool so small collections never look like
    // identical rows, and never leave an empty tile.
    const tiles: ContentImage[] = Array.from({ length: total }, (_, i) => {
      const offset = Math.floor(i / cfg.columns) * (items.length > 1 ? 1 : 0);
      const idx = items.length === 1 ? 0 : (i + offset + pick(i, items.length)) % items.length;
      return items[idx]!;
    });
    return Array.from({ length: cfg.columns }, (_, c) =>
      tiles.filter((_, i) => i % cfg.columns === c),
    );
  }, [items, cfg.columns, cfg.rows]);

  useEffect(() => {
    if (reduced || parallax <= 0 || bp === "mobile") return;
    const stage = stageRef.current;
    if (!stage) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        stage.style.setProperty("--drift-x", `${(-x * 28 * parallax).toFixed(2)}px`);
        stage.style.setProperty("--drift-y", `${(-y * 22 * parallax).toFixed(2)}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, parallax, bp]);

  if (!columns.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={stageRef}
        className="absolute"
        style={{
          inset: "-18%",
          width: "136%",
          height: "136%",
          perspective: "1400px",
          transform: "translate3d(var(--drift-x, 0px), var(--drift-y, 0px), 0)",
          transition: "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="flex h-full w-full justify-center"
          style={{
            gap: `${cfg.gap}px`,
            transform: `rotateX(${tilt}deg) rotateZ(${turn}deg) scale(1.25)`,
            transformStyle: "preserve-3d",
          }}
        >
          {columns.map((column, columnIndex) => {
            const v = variance(columnIndex);
            const duration = speed * (1 + v * 0.35);
            const reverse = columnIndex % 2 === 1;
            return (
              <div
                key={columnIndex}
                className="flex-1"
                style={{
                  transform: `translateZ(${(columnIndex % 3) * -45}px) translateY(${v * -60}px)`,
                }}
              >
                <div
                  className={reduced ? "" : "drift-column"}
                  style={
                    reduced
                      ? undefined
                      : {
                          animationDuration: `${duration}s`,
                          animationDirection: reverse ? "reverse" : "normal",
                          animationDelay: `-${(v * duration).toFixed(2)}s`,
                        }
                  }
                >
                  {[0, 1].map((copy) => (
                    <div key={copy} style={{ display: "grid", gap: `${cfg.gap}px` }}>
                      {column.map((image, i) => (
                        <div
                          key={`${copy}-${i}-${image.id}`}
                          className="overflow-hidden bg-onyx"
                          style={{ height: `${cfg.tileHeight}px`, marginBottom: `${cfg.gap}px` }}
                        >
                          <img
                            src={image.src}
                            alt=""
                            width={image.width}
                            height={image.height}
                            loading={copy === 0 && i < 3 ? "eager" : "lazy"}
                            decoding="async"
                            className="h-full w-full object-cover"
                            style={{ filter: grayscale ? "grayscale(1)" : undefined }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Readability treatment over the photographs */}
      <div
        className="absolute inset-0"
        style={{ background: `oklch(0.16 0.004 60 / ${dim})` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.16 0.004 60 / 0.55) 0%, oklch(0.16 0.004 60 / 0.15) 38%, oklch(0.16 0.004 60 / 0.75) 100%)",
        }}
      />
    </div>
  );
}
