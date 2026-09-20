import type { ComponentType } from "react";
type Item = {
  width?: number | null;
  height?: number | null;
  image: string;
  alt?: string;
  caption?: string;
  text?: string;
};
declare const DepthCarousel: ComponentType<{
  items: Item[];
  radius?: number;
  showIndicators?: boolean;
  onChange?: (index: number) => void;
}>;
export default DepthCarousel;
