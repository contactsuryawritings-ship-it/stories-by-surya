import { useEffect, useRef, useState, type ReactNode } from "react";

/** A stable stage with an inner frame that smoothly fits each media item's proportions. */
export function AspectStage({ ratio, children }: { ratio: number; children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBounds({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const width = Math.min(bounds.width, bounds.height * ratio);
  return (
    <div
      ref={stageRef}
      className="relative grid h-full w-full place-items-center overflow-hidden"
      data-media-stage
    >
      <div
        className="relative overflow-hidden transition-[width,height] duration-500 ease-in-out motion-reduce:transition-none"
        data-media-frame
        style={{ width, height: width / ratio }}
      >
        {children}
      </div>
    </div>
  );
}
