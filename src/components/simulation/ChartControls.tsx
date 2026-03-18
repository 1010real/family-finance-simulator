import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppState, useAppDispatch } from "@/state/hooks";
import { saveViewSettings } from "@/storage/local/viewSettingsStore";
import { saveDarkMode } from "@/storage/local/darkModeStore";
import type { ViewMode, YearsToDisplay } from "@/types/storage";

const YEAR_OPTIONS: YearsToDisplay[] = [1, 3, 5, 10, 20, 30];

export default function ChartControls() {
  const { viewSettings, darkMode } = useAppState();
  const dispatch = useAppDispatch();

  function setViewMode(viewMode: ViewMode) {
    const next = { ...viewSettings, viewMode };
    dispatch({ type: "SET_VIEW_SETTINGS", payload: { viewMode } });
    saveViewSettings(next);
  }

  function setYears(yearsToDisplay: YearsToDisplay) {
    const next = { ...viewSettings, yearsToDisplay };
    dispatch({ type: "SET_VIEW_SETTINGS", payload: { yearsToDisplay } });
    saveViewSettings(next);
  }

  function toggleDarkMode() {
    const next = !darkMode;
    dispatch({ type: "SET_DARK_MODE", payload: next });
    saveDarkMode(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 border-b border-border bg-background">
      {/* View mode toggle */}
      <div className="flex items-center gap-1 rounded-md border border-border overflow-hidden">
        <button
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            viewSettings.viewMode === "monthly"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
          }`}
          onClick={() => setViewMode("monthly")}
        >
          月次
        </button>
        <button
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            viewSettings.viewMode === "yearly"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
          }`}
          onClick={() => setViewMode("yearly")}
        >
          年次
        </button>
      </div>

      {/* Years selector */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">表示年数:</span>
        {YEAR_OPTIONS.map((y) => (
          <Button
            key={y}
            variant={viewSettings.yearsToDisplay === y ? "default" : "outline"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setYears(y)}
          >
            {y}年
          </Button>
        ))}
      </div>

      {/* Start year */}
      <div className="flex items-center gap-2 ml-auto">
        <Label className="text-xs text-muted-foreground">開始年:</Label>
        <input
          type="number"
          className="w-20 h-7 rounded-md border border-input bg-background px-2 text-sm"
          value={viewSettings.simulationStartYear}
          onChange={(e) => {
            const simulationStartYear = Number(e.target.value);
            const next = { ...viewSettings, simulationStartYear };
            dispatch({ type: "SET_VIEW_SETTINGS", payload: { simulationStartYear } });
            saveViewSettings(next);
          }}
        />
      </div>

      {/* Dark mode */}
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
