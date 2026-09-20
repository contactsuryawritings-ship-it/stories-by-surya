import type { ComponentType } from "react";
type Item = {
  width?: number | null;
  height?: number | null;
  image: string;
  alt?: string;
  caption?: string;
  text?: string;
};
declare const MorphSlider: ComponentType<{
  items: Item[];
  radius?: number;
  showIndicators?: boolean;
  showCaptions?: boolean;
  onChange?: (index: number) => void;
  onError?: () => void;
}>;
export default MorphSlider;
