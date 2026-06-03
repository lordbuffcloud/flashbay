import { Platform, useWindowDimensions } from "react-native";

/** True on phones and narrow web viewports (< 640px). */
export function useIsCompact(): boolean {
  const { width } = useWindowDimensions();
  return width < 640;
}

/** True when the web app has enough horizontal room for a desktop catalog. */
export function useIsWideDesktop(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= 1024;
}

/** Centered catalog column that expands on desktop web instead of staying phone-width. */
export function useContentWidth(): number | "100%" {
  const { width } = useWindowDimensions();
  if (width >= 1280) return 1180;
  if (width >= 1024) return Math.min(width - 64, 1100);
  if (width >= 768) return Math.min(width - 32, 720);
  return "100%";
}
