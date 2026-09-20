import type { ComponentType } from "react";
type Item = { image: string; alt?: string; caption?: string; text?: string };
declare const RippleDistortion: ComponentType<{
  src: string;
  grayscale?: boolean;
  trigger?: string;
  onError?: () => void;
}>;
export default RippleDistortion;
