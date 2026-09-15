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

function sourceAspect(image: ContentImage) {
  const measured = image.width > 0 && image.height > 0 ? image.width / image.height : 1;
  const orientation = image.orientation;
  const fallback = orientation === "portrait" ? 2 / 3 : orientation === "landscape" ? 3 / 2 : 1;
  const aspect = Number.isFinite(measured) && measured > 0 ? measured : fallback;
  return Math.min(1.75, Math.max(0.62, aspect));
}

const CONFIG = {
  mobile: { columns: 6, rows: 9, gap: 6 },
  tablet: { columns: 8, rows: 9, gap: 8 },
  desktop: { columns: 9, rows: 10, gap: 8 },
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
    const packed = Array.from({ length: cfg.columns }, () => [] as ContentImage[]);
    const heights = Array.from({ length: cfg.columns }, () => 0);
    const lastIds = Array.from({ length: cfg.columns }, () => "");

    for (let i = 0; i < total; i += 1) {
      const columnIndex = heights.indexOf(Math.min(...heights));
      let imageIndex = items.length === 1 ? 0 : (i + pick(i, items.length)) % items.length;
      for (
        let attempt = 0;
        attempt < items.length && items[imageIndex]?.id === lastIds[columnIndex];
        attempt += 1
      ) {
        imageIndex = (imageIndex + 1) % items.length;
      }
      const image = items[imageIndex]!;
      packed[columnIndex]!.push(image);
      lastIds[columnIndex] = image.id;
      heights[columnIndex]! += 1 / sourceAspect(image);
    }
    return packed;
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
                          style={{
                            aspectRatio: sourceAspect(image),
                            marginBottom: `${cfg.gap}px`,
                          }}
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
      <div className="absolute inset-0" style={{ background: `oklch(0.16 0.004 60 / ${dim})` }} />
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
