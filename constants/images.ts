import wordmark from "@/assets/images/wordmark.png";
import monogram from "@/assets/images/monogram.png";
import appIcon from "@/assets/images/icon.png";
import stateEmpty from "@/assets/images/state-empty.png";
import stateError from "@/assets/images/state-error.png";
import stateSuccess from "@/assets/images/state-success.png";

export const images = {
  wordmark,
  monogram,
  appIcon,
  stateEmpty,
  stateError,
  stateSuccess,
} as const;

export type ImageKey = keyof typeof images;
