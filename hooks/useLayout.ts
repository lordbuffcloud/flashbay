import { useWindowDimensions } from "react-native";

/** True on phones and narrow web viewports (< 640px). */
export function useIsCompact(): boolean {
  const { width } = useWindowDimensions();
  return width < 640;
}

/** Centered catalog column on desktop web. */
export function useContentWidth(): number | "100%" {
  const { width } = useWindowDimensions();
  if (width >= 1024) return 720;
  if (width >= 768) return Math.min(width - 32, 640);
  return "100%";
}
