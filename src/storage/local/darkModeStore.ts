const KEY = "ffs:darkMode";

export function loadDarkMode(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) {
      // Default to system preference
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return raw === "true";
  } catch {
    return false;
  }
}

export function saveDarkMode(enabled: boolean): void {
  localStorage.setItem(KEY, String(enabled));
}
