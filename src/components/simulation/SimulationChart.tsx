import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { SimulationResult, ChartDataPoint } from "@/types/simulation";
import type { ViewMode } from "@/types/storage";
import { formatShortNumber } from "@/lib/formatters";

interface Props {
  result: SimulationResult;
  viewMode: ViewMode;
}

function buildChartData(result: SimulationResult, viewMode: ViewMode): ChartDataPoint[] {
  if (result.items.length === 0) return [];
  if (result.simulatedMonths === 0) return [];

  const firstItem = result.items[0];
  if (!firstItem) return [];

  if (viewMode === "monthly") {
    return firstItem.dataPoints.map((dp, idx) => {
      const label = `${dp.year}-${String(dp.month).padStart(2, "0")}`;
      const point: ChartDataPoint = { label };
      for (const item of result.items) {
        const val = item.dataPoints[idx]?.amount ?? 0;
        point[item.itemId] = Math.round(val);
      }
      return point;
    });
  } else {
    // Yearly: group by year, sum amounts
    const yearMap = new Map<number, ChartDataPoint>();

    for (const item of result.items) {
      for (const dp of item.dataPoints) {
        if (!yearMap.has(dp.year)) {
          yearMap.set(dp.year, { label: String(dp.year) });
        }
        const point = yearMap.get(dp.year)!;
        const existing = typeof point[item.itemId] === "number" ? (point[item.itemId] as number) : 0;
        point[item.itemId] = Math.round(existing + dp.amount);
      }
    }

    return Array.from(yearMap.values()).sort((a, b) =>
      String(a.label).localeCompare(String(b.label))
    );
  }
}

function formatYAxisTick(value: number): string {
  return formatShortNumber(value);
}

export default function SimulationChart({ result, viewMode }: Props) {
  const data = buildChartData(result, viewMode);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg font-medium">データがありません</p>
        <p className="text-sm mt-1">左パネルで家計項目を追加してください</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 16, right: 24, left: 16, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          interval="preserveStartEnd"
          className="fill-muted-foreground"
        />
        <YAxis
          tickFormatter={formatYAxisTick}
          tick={{ fontSize: 11 }}
          width={72}
          className="fill-muted-foreground"
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            const item = result.items.find((i) => i.itemId === name);
            return [formatShortNumber(value), item?.itemName ?? name];
          }}
          contentStyle={{
            fontSize: 12,
            borderRadius: 6,
          }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
        {result.items.map((item) => (
          <Bar
            key={item.itemId}
            dataKey={item.itemId}
            name={item.itemName}
            fill={item.color}
            stackId="stack"
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
