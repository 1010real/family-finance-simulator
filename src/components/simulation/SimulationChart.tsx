import {
  ComposedChart,
  Bar,
  Line,
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

const TOTAL_KEY = "__total__";

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
      const point: ChartDataPoint = { label, [TOTAL_KEY]: 0 };
      let total = 0;

      for (const item of result.items) {
        const d = item.dataPoints[idx];
        if (item.isBalanceItem) {
          // Show cumulative balance on the right axis
          point[item.itemId] = Math.round(d?.balance ?? 0);
        } else {
          const val = d?.amount ?? 0;
          point[item.itemId] = Math.round(val);
        }
        // Net cash flow uses amount for all items (investment amount = outflow)
        total += d?.amount ?? 0;
      }

      point[TOTAL_KEY] = Math.round(total);
      return point;
    });
  } else {
    // Yearly: non-balance items sum amounts; balance items use year-end balance
    const yearMap = new Map<number, ChartDataPoint>();
    const yearTotals = new Map<number, number>();

    for (const item of result.items) {
      for (const dp of item.dataPoints) {
        if (!yearMap.has(dp.year)) {
          yearMap.set(dp.year, { label: String(dp.year) });
          yearTotals.set(dp.year, 0);
        }
        const point = yearMap.get(dp.year)!;

        if (item.isBalanceItem) {
          // Overwrite each month — last (December / year-end) value wins
          point[item.itemId] = Math.round(dp.balance ?? 0);
        } else {
          const existing = typeof point[item.itemId] === "number" ? (point[item.itemId] as number) : 0;
          point[item.itemId] = Math.round(existing + dp.amount);
        }

        // Always accumulate cash-flow total using amount
        yearTotals.set(dp.year, (yearTotals.get(dp.year) ?? 0) + dp.amount);
      }
    }

    const sorted = Array.from(yearMap.values()).sort((a, b) =>
      String(a.label).localeCompare(String(b.label))
    );

    for (const point of sorted) {
      point[TOTAL_KEY] = Math.round(yearTotals.get(Number(point.label)) ?? 0);
    }

    return sorted;
  }
}

export default function SimulationChart({ result, viewMode }: Props) {
  const data = buildChartData(result, viewMode);

  const flowItems = result.items.filter((i) => !i.isBalanceItem);
  const balanceItems = result.items.filter((i) => i.isBalanceItem);
  const hasBalanceItems = balanceItems.length > 0;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg font-medium">データがありません</p>
        <p className="text-sm mt-1">左パネルで家計項目を追加してください</p>
      </div>
    );
  }

  function tooltipFormatter(value: number, name: string): [string, string] {
    if (name === TOTAL_KEY) return [formatShortNumber(value), "収支合計"];
    const item = result.items.find((i) => i.itemId === name);
    const label = item
      ? item.isBalanceItem
        ? `${item.itemName}（残高）`
        : item.itemName
      : name;
    return [formatShortNumber(value), label];
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 16, right: hasBalanceItems ? 80 : 24, left: 16, bottom: 40 }}
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

        {/* Left axis — monthly cash flows and net total line */}
        <YAxis
          yAxisId="left"
          tickFormatter={formatShortNumber}
          tick={{ fontSize: 11 }}
          width={72}
          className="fill-muted-foreground"
        />

        {/* Right axis — investment cumulative balance */}
        {hasBalanceItems && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatShortNumber}
            tick={{ fontSize: 11 }}
            width={72}
            className="fill-muted-foreground"
          />
        )}

        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{ fontSize: 12, borderRadius: 6 }}
        />

        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" strokeWidth={2} />

        {/* Income / expense stacked bars on left axis */}
        {flowItems.map((item) => (
          <Bar
            key={item.itemId}
            yAxisId="left"
            dataKey={item.itemId}
            name={item.itemName}
            fill={item.color}
            stackId="stack"
            maxBarSize={48}
          />
        ))}

        {/* Investment cumulative balance bars on right axis */}
        {balanceItems.map((item) => (
          <Bar
            key={item.itemId}
            yAxisId="right"
            dataKey={item.itemId}
            name={item.itemName}
            fill={item.color}
            stackId="balance-stack"
            maxBarSize={48}
            opacity={0.75}
          />
        ))}

        {/* Net cash-flow line on left axis */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey={TOTAL_KEY}
          name="収支合計"
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
