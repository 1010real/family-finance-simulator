import {
  ComposedChart,
  Bar,
  Area,
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

/** Key used for the net cash-flow line */
const TOTAL_KEY = "__total__";
/** Suffix appended to itemId for background balance/debt area keys */
const BG_SUFFIX = "_bg";

interface Props {
  result: SimulationResult;
  viewMode: ViewMode;
}

// ---------------------------------------------------------------------------
// Y-axis zero-alignment helpers
// ---------------------------------------------------------------------------

/**
 * Returns the fraction (0–1) of the total axis range that sits below zero.
 * e.g. min=-200, max=400 → 200/(200+400) ≈ 0.333
 */
function zeroFrac(min: number, max: number): number {
  if (min >= 0) return 0;
  if (max <= 0) return 1;
  return Math.abs(min) / (Math.abs(min) + max);
}

/**
 * Stretches [min, max] so that zero sits at `targetFrac` of the total range.
 * Only ever expands the range — never shrinks it.
 */
function stretchDomain(min: number, max: number, targetFrac: number): [number, number] {
  if (targetFrac <= 0) return [Math.min(min, 0), max];
  if (targetFrac >= 1) return [min, Math.max(max, 0)];

  const currentFrac = zeroFrac(min, max);
  if (currentFrac < targetFrac) {
    // Need more negative space: push min further down
    const newMin = -(targetFrac / (1 - targetFrac)) * max;
    return [Math.min(newMin, min), max];
  } else {
    // Need more positive space: push max further up
    const newMax = ((1 - targetFrac) / targetFrac) * Math.abs(min);
    return [min, Math.max(newMax, max)];
  }
}

/**
 * Computes axis domains for left (flow) and right (balance) axes so that
 * their zero lines are at the same vertical position in the chart.
 */
function computeAlignedDomains(
  data: ChartDataPoint[],
  result: SimulationResult
): { left: [number, number]; right: [number, number] } {
  let lMin = 0, lMax = 0, rMin = 0, rMax = 0;

  for (const point of data) {
    for (const item of result.items) {
      const v = (point[item.itemId] as number) ?? 0;
      if (v < lMin) lMin = v;
      if (v > lMax) lMax = v;

      if (item.isBalanceItem) {
        const bg = (point[item.itemId + BG_SUFFIX] as number) ?? 0;
        if (bg < rMin) rMin = bg;
        if (bg > rMax) rMax = bg;
      }
    }
    const t = (point[TOTAL_KEY] as number) ?? 0;
    if (t < lMin) lMin = t;
    if (t > lMax) lMax = t;
  }

  // 10 % padding on each extreme
  const lPad = (Math.abs(lMin) + lMax) * 0.1 || 1;
  const rPad = (Math.abs(rMin) + rMax) * 0.1 || 1;
  lMin -= lPad; lMax += lPad;
  rMin -= rPad; rMax += rPad;

  const targetFrac = Math.max(zeroFrac(lMin, lMax), zeroFrac(rMin, rMax));

  return {
    left: stretchDomain(lMin, lMax, targetFrac),
    right: stretchDomain(rMin, rMax, targetFrac),
  };
}

// ---------------------------------------------------------------------------
// Chart data builder
// ---------------------------------------------------------------------------

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
        const flow = d?.amount ?? 0;
        point[item.itemId] = Math.round(flow);
        total += flow;

        if (item.isBalanceItem) {
          point[item.itemId + BG_SUFFIX] = Math.round(d?.balance ?? 0);
        }
      }
      point[TOTAL_KEY] = Math.round(total);
      return point;
    });
  }

  // Yearly: sum monthly flows; for balance items take the year-end balance
  const yearMap = new Map<number, ChartDataPoint>();
  const yearTotals = new Map<number, number>();

  for (const item of result.items) {
    for (const dp of item.dataPoints) {
      if (!yearMap.has(dp.year)) {
        yearMap.set(dp.year, { label: String(dp.year) });
        yearTotals.set(dp.year, 0);
      }
      const point = yearMap.get(dp.year)!;

      const prev = typeof point[item.itemId] === "number" ? (point[item.itemId] as number) : 0;
      point[item.itemId] = Math.round(prev + dp.amount);

      if (item.isBalanceItem) {
        point[item.itemId + BG_SUFFIX] = Math.round(dp.balance ?? 0);
      }

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SimulationChart({ result, viewMode }: Props) {
  const data = buildChartData(result, viewMode);
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

  const domains = hasBalanceItems ? computeAlignedDomains(data, result) : null;

  function tooltipFormatter(value: number, name: string): [string, string] {
    if (name === TOTAL_KEY) return [formatShortNumber(value), "収支合計"];

    if (typeof name === "string" && name.endsWith(BG_SUFFIX)) {
      const itemId = name.slice(0, -BG_SUFFIX.length);
      const item = result.items.find((i) => i.itemId === itemId);
      const label = item ? `${item.itemName}（${item.balanceLabel}）` : name;
      return [formatShortNumber(Math.abs(value)), label];
    }

    const item = result.items.find((i) => i.itemId === name);
    return [formatShortNumber(value), item?.itemName ?? name];
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
          domain={domains ? domains.left : ["auto", "auto"]}
          className="fill-muted-foreground"
        />

        {/* Right axis — cumulative balance / remaining debt areas */}
        {hasBalanceItems && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatShortNumber}
            tick={{ fontSize: 11 }}
            width={72}
            domain={domains ? domains.right : ["auto", "auto"]}
            className="fill-muted-foreground"
          />
        )}

        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{ fontSize: 12, borderRadius: 6 }}
        />

        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" strokeWidth={2} />

        {/*
          Background areas rendered FIRST so they appear behind bars in SVG paint order.
          Investment balance → positive area growing upward (right axis).
          Loan remaining debt → negative area shrinking toward zero (right axis).
        */}
        {balanceItems.map((item) => (
          <Area
            key={item.itemId + BG_SUFFIX}
            yAxisId="right"
            type="monotone"
            dataKey={item.itemId + BG_SUFFIX}
            fill={item.color}
            fillOpacity={0.18}
            stroke={item.color}
            strokeOpacity={0.4}
            strokeWidth={1}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        ))}

        {/*
          Cash-flow bars rendered AFTER areas — appear in front.
          Positive = income, negative = expense / payment / contribution.
        */}
        {result.items.map((item) => (
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

        {/* Net cash-flow line — sum of all monthly amounts */}
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
