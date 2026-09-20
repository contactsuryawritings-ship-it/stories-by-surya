import type { ComponentType } from "react";
type Item = {
  width?: number | null;
  height?: number | null;
  image: string;
  alt?: string;
  caption?: string;
  text?: string;
};
declare const CircularGallery: ComponentType<{
  items: Item[];
  bend?: number;
  font?: string;
  textColor?: string;
  onError?: () => void;
}>;
export default CircularGallery;
