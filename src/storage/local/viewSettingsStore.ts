import type { ViewSettings, ViewMode, YearsToDisplay } from "@/types/storage";

const KEY = "ffs:viewSettings";

const VALID_VIEW_MODES: ViewMode[] = ["monthly", "yearly"];
const VALID_YEARS: YearsToDisplay[] = [1, 3, 5, 10, 20, 30];

const currentYear = new Date().getFullYear();

const DEFAULTS: ViewSettings = {
  viewMode: "yearly",
  yearsToDisplay: 10,
  simulationStartYear: currentYear,
};

function isViewMode(value: unknown): value is ViewMode {
  return typeof value === "string" && (VALID_VIEW_MODES as string[]).includes(value);
}

function isYearsToDisplay(value: unknown): value is YearsToDisplay {
  return typeof value === "number" && (VALID_YEARS as number[]).includes(value);
}

function isValidViewSettings(value: unknown): value is ViewSettings {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isViewMode(v["viewMode"]) &&
    isYearsToDisplay(v["yearsToDisplay"]) &&
    typeof v["simulationStartYear"] === "number"
  );
}

export function loadViewSettings(): ViewSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed: unknown = JSON.parse(raw);
    if (isValidViewSettings(parsed)) return parsed;
    return { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveViewSettings(settings: ViewSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
