import { useMemo } from "react";
import ChartControls from "./ChartControls";
import ChartLegend from "./ChartLegend";
import SimulationChart from "./SimulationChart";
import { useAppState } from "@/state/hooks";
import { runSimulation } from "@/calculators";
import type { CalculatorContext } from "@/calculators";

export default function SimulationPanel() {
  const { items, viewSettings, hoveredItemId } = useAppState();

  const simulationResult = useMemo(() => {
    const ctx: CalculatorContext = {
      startYear: viewSettings.simulationStartYear,
      startMonth: 1,
      totalMonths: viewSettings.yearsToDisplay * 12,
    };
    return runSimulation(items, ctx);
  }, [items, viewSettings]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">シミュレーション結果</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {viewSettings.simulationStartYear}年〜{viewSettings.simulationStartYear + viewSettings.yearsToDisplay - 1}年（{viewSettings.yearsToDisplay}年間）
        </p>
      </div>

      <ChartControls />
      <ChartLegend items={simulationResult.items} />

      <div className="flex-1 min-h-0 p-2">
        <SimulationChart
          result={simulationResult}
          viewMode={viewSettings.viewMode}
          hoveredItemId={hoveredItemId}
        />
      </div>
    </div>
  );
}
