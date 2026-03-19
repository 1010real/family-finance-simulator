import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ITEM_COLORS = [
  "#4f86c6",
  "#e07b54",
  "#5cad8a",
  "#b06dbd",
  "#d4a843",
  "#5c9ec6",
  "#c66d6d",
  "#6dbc8a",
  "#9e7bc4",
  "#c4a35a",
  "#6d9ec6",
  "#c47b8a",
];

/** Returns the first palette color not already used; falls back to cycling. */
export function getNextColor(usedColors: string[]): string {
  for (const color of ITEM_COLORS) {
    if (!usedColors.includes(color)) return color;
  }
  return ITEM_COLORS[usedColors.length % ITEM_COLORS.length];
}
