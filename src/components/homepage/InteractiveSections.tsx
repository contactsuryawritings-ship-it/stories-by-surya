import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode, PointerEvent } from "react";

import { useReducedMotion } from "@/components/drift-wall/useReducedMotion";
import type { ContentImage } from "@/lib/content/schema";
import { photoFrameStyle, usePhotoAspect } from "./usePhotoAspect";
import { AspectStage } from "@/components/public/AspectStage";
import { SelectionBelt } from "@/components/public/SelectionBelt";
import { prepareImages } from "@/lib/images/preload";

const RippleEffect = lazy(() => import("./effects/RippleDistortion"));
const DepthEffect = lazy(() => import("./effects/DepthCarousel"));
const MorphEffect = lazy(() => import("./effects/MorphSlider"));
const CircularEffect = lazy(() => import("./effects/CircularGallery"));

type GalleryProps = { items: ContentImage[] };

/** Mount once near the viewport. The reserved dimensions never collapse on scroll. */
function SectionViewport({
  children,
  className,
  style,
  preloadSources = [],
}: {
  children: ReactNode;
  className: string;
  style?: CSSProperties | undefined;
  preloadSources?: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [prepared, setPrepared] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    void prepareImages(preloadSources, undefined, 1200).then(() => {
      if (!cancelled) setPrepared(true);
    });
    return () => {
      cancelled = true;
    };
  }, [active, preloadSources]);
  return (
    <div ref={ref} className={className} style={style}>
      {active && prepared ? children : active ? <SectionPlaceholder /> : null}
    </div>
  );
}

function SectionPlaceholder() {
  return (
    <div className="absolute inset-0 animate-pulse bg-onyx/90" aria-label="Preparing photographs" />
  );
}

class EffectBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Ordinary image controls remain available if WebGL fails or motion is reduced. */
function EffectSurface({
  fallback,
  children,
}: {
  fallback: ReactNode;
  children: (onError: () => void) => ReactNode;
}) {
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  if (reduced || failed) return fallback;
  return (
    <EffectBoundary fallback={fallback}>
      <Suspense fallback={fallback}>{children(onError)}</Suspense>
    </EffectBoundary>
  );
}

function ArrowButton({
  direction,
  onClick,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-11 shrink-0 place-items-center border border-current/30 text-lg transition-colors hover:bg-foreground hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );
}

function ImageFrame({ image }: { image: ContentImage }) {
  return (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="block h-full w-full object-contain"
    />
  );
}

function useGallery(items: ContentImage[]) {
  const [selected, setSelected] = useState(0);
  const index = items.length ? selected % items.length : 0;
  const move = (step: number) =>
    setSelected((current) => (current + step + items.length) % items.length);
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    index,
    setIndex: setSelected,
    move,
    gestures: {
      onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
        start.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
        const point = start.current;
        start.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
        if (!point) return;
        const dx = event.clientX - point.x;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(event.clientY - point.y))
          move(dx < 0 ? 1 : -1);
      },
      onPointerCancel: () => {
        start.current = null;
      },
    },
  };
}

function StaticGallery({ items, onChange }: GalleryProps & { onChange?: (index: number) => void }) {
  const { index, move, gestures } = useGallery(items);
  useEffect(() => {
    onChange?.(index);
  }, [index, onChange]);
  if (!items.length) return null;
  return (
    <div
      className="relative h-full w-full touch-pan-y"
      {...gestures}
      role="group"
      aria-roledescription="carousel"
      aria-label="Photographs"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <ImageFrame image={items[index]!} />
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-onyx/65 p-3 text-ivory">
        <p className="eyebrow" aria-live="polite">
          {index + 1} / {items.length}
        </p>
        <div className="flex gap-2">
          <ArrowButton direction="left" onClick={() => move(-1)} label="Previous photograph" />
          <ArrowButton direction="right" onClick={() => move(1)} label="Next photograph" />
        </div>
      </div>
    </div>
  );
}

export function RippleDistortion({ items }: GalleryProps) {
  const { index, setIndex, move, gestures } = useGallery(items);
  const ratio = usePhotoAspect(items[index]);
  const preloadSources = useMemo(() => items.map((item) => item.src), [items]);
  if (!items.length) return null;
  const image = items[index]!;
  return (
    <div className="shell">
      <div className="bg-onyx p-3 text-ivory md:p-6">
        <SectionViewport
          className="relative h-[min(60svh,40rem)] overflow-hidden"
          preloadSources={preloadSources}
        >
          <div
            className="relative h-full touch-pan-y"
            {...gestures}
            role="group"
            aria-roledescription="carousel"
            aria-label="Top Picks. Swipe or use the arrow buttons to explore."
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                move(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
          >
            <AspectStage ratio={ratio}>
              <ImageFrame image={image} />
              <div className="absolute inset-0" aria-hidden="true">
                <EffectSurface key={image.id} fallback={null}>
                  {(onError) => (
                    <RippleEffect
                      src={image.src}
                      grayscale={false}
                      trigger="both"
                      onError={onError}
                    />
                  )}
                </EffectSurface>
              </div>
            </AspectStage>
          </div>
        </SectionViewport>
        <div className="my-4 flex items-center justify-between gap-4">
          <p className="eyebrow" aria-live="polite">
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>
          <div className="flex gap-2">
            <ArrowButton direction="left" onClick={() => move(-1)} label="Previous top pick" />
            <ArrowButton direction="right" onClick={() => move(1)} label="Next top pick" />
          </div>
        </div>
        <SelectionBelt index={index} label="Top Picks selection">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show top pick ${itemIndex + 1}`}
              aria-current={itemIndex === index}
              onClick={() => setIndex(itemIndex)}
              className={`size-16 shrink-0 overflow-hidden border md:size-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${itemIndex === index ? "border-ivory" : "border-ivory/20 opacity-55"}`}
            >
              <img src={item.src} alt="" className="h-full w-full object-contain" loading="lazy" />
            </button>
          ))}
        </SelectionBelt>
      </div>
    </div>
  );
}

function AnimatedGallery({ items, kind }: GalleryProps & { kind: "depth" | "morph" | "circular" }) {
  const data = useMemo(
    () =>
      items.map((image, index) => ({
        image: image.src,
        alt: image.alt,
        width: image.width,
        height: image.height,
        text: String(index + 1).padStart(2, "0"),
      })),
    [items],
  );
  const [index, setIndex] = useState(0);
  const ratio = usePhotoAspect(items[index]);
  const preloadSources = useMemo(() => items.map((item) => item.src), [items]);
  if (!items.length) return null;
  return (
    <div className="shell">
      <SectionViewport
        className={`relative isolate overflow-hidden bg-onyx text-ivory ${kind === "morph" ? "" : "h-[min(70svh,38rem)] min-h-[20rem]"}`}
        style={kind === "morph" ? photoFrameStyle(ratio) : undefined}
        preloadSources={preloadSources}
      >
        <EffectSurface fallback={<StaticGallery items={items} onChange={setIndex} />}>
          {(onError) =>
            kind === "depth" ? (
              <DepthEffect items={data} radius={2} showIndicators={false} onChange={setIndex} />
            ) : kind === "morph" ? (
              <MorphEffect
                items={data}
                radius={0}
                showCaptions={false}
                showIndicators={false}
                onChange={setIndex}
                onError={onError}
              />
            ) : (
              <CircularEffect
                items={data}
                bend={1}
                font="24px sans-serif"
                textColor="#f4f0e9"
                onError={onError}
              />
            )
          }
        </EffectSurface>
      </SectionViewport>
      <div className="mt-4 flex justify-between gap-4 text-muted-foreground">
        <p className="eyebrow">Drag or swipe to explore</p>
        {kind !== "circular" ? (
          <p className="eyebrow" aria-live="polite">
            {Math.min(index + 1, items.length)} / {items.length}
            <span className="sr-only">. {items[index]?.alt}</span>
          </p>
        ) : (
          <p className="eyebrow">{items.length} photographs</p>
        )}
      </div>
    </div>
  );
}

export function DepthCarousel(props: GalleryProps) {
  return <AnimatedGallery {...props} kind="depth" />;
}
export function MorphSlider(props: GalleryProps) {
  return <AnimatedGallery {...props} kind="morph" />;
}
export function CircularGallery(props: GalleryProps) {
  return <AnimatedGallery {...props} kind="circular" />;
}
