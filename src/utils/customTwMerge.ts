import classnames from "classnames";
import { twMerge } from "tailwind-merge";

export const customTwMerge = (...args: Parameters<typeof classnames>) =>
  twMerge(classnames(...args));
