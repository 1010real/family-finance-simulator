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
 * Generates "nice" round tick values covering [min, max] and always including 0.
 */
function niceTicks(min: number, max: number, targetCount = 6): number[] {
  const range = max - min || 1;
  const roughStep = range / targetCount;
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const step =
    ([1, 2, 5, 10] as const).map((f) => mag * f).find((s) => s >= roughStep) ?? mag * 10;

  const ticks: number[] = [];
  const startTick = Math.floor(min / step) * step;
  for (let t = startTick; t <= max + step * 0.01; t = Math.round((t + step) / step) * step) {
    const rounded = Math.round(t / step) * step;
    if (rounded >= min - step * 0.01) ticks.push(rounded);
  }

  // Always include 0 so the baseline is clearly labelled on both axes
  if (!ticks.includes(0)) {
    ticks.push(0);
    ticks.sort((a, b) => a - b);
  }

  return ticks;
}

/**
 * Computes axis domains and ticks for left (flow) and right (balance) axes so
 * that their zero lines sit at the same vertical position in the chart.
 *
 * Strategy: generate left ticks first, count how many are above/below zero,
 * then generate right ticks using the same above/below counts so recharts
 * places zero at an identical tick-index on both axes.
 */
function computeAlignedDomains(
  data: ChartDataPoint[],
  result: SimulationResult
): { left: [number, number]; right: [number, number]; leftTicks: number[]; rightTicks: number[] } {
  let lMin = 0, lMax = 0, rMin = 0, rMax = 0;

  for (const point of data) {
    let posSum = 0, negSum = 0;
    for (const item of result.items) {
      const v = (point[item.itemId] as number) ?? 0;
      if (v < lMin) lMin = v;
      if (v > lMax) lMax = v;

      if (item.isBalanceItem) {
        const bg = (point[item.itemId + BG_SUFFIX] as number) ?? 0;
        if (bg >= 0) posSum += bg; else negSum += bg;
      }
    }
    if (posSum > rMax) rMax = posSum;
    if (negSum < rMin) rMin = negSum;
    const t = (point[TOTAL_KEY] as number) ?? 0;
    if (t < lMin) lMin = t;
    if (t > lMax) lMax = t;
  }

  // 10 % padding on each extreme
  const lPad = (Math.abs(lMin) + lMax) * 0.1 || 1;
  const rPad = (Math.abs(rMin) + rMax) * 0.1 || 1;

  // Left ticks: use niceTicks as usual
  const leftTicks = niceTicks(lMin - lPad, lMax + lPad);
  const negCount = leftTicks.filter((t) => t < 0).length;
  const posCount = leftTicks.filter((t) => t > 0).length;

  // Right ticks: pick a step that covers the data with the same neg/pos count
  const rMaxPadded = rMax + rPad;
  const rMinPadded = rMin - rPad;
  let minStep = 1;
  if (posCount > 0) minStep = Math.max(minStep, rMaxPadded / posCount);
  if (negCount > 0) minStep = Math.max(minStep, Math.abs(rMinPadded) / negCount);
  const rMag = Math.pow(10, Math.floor(Math.log10(minStep)));
  const rStep =
    ([1, 2, 5, 10] as const).map((f) => rMag * f).find((s) => s >= minStep) ?? rMag * 10;

  const rightTicks: number[] = [0];
  for (let i = 1; i <= posCount; i++) rightTicks.push(rStep * i);
  for (let i = 1; i <= negCount; i++) rightTicks.push(-rStep * i);
  rightTicks.sort((a, b) => a - b);

  return {
    left: [leftTicks[0], leftTicks[leftTicks.length - 1]],
    right: [rightTicks[0], rightTicks[rightTicks.length - 1]],
    leftTicks,
    rightTicks,
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

  const aligned = hasBalanceItems ? computeAlignedDomains(data, result) : null;
  const domains = aligned ? { left: aligned.left, right: aligned.right } : null;
  const leftTicks = aligned?.leftTicks ?? (domains ? niceTicks(domains.left[0], domains.left[1]) : undefined);
  const rightTicks = aligned?.rightTicks;

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
        stackOffset="sign"
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
          ticks={leftTicks}
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
            ticks={rightTicks}
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
            stackId="balance-stack"
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
            maxBarSize={20}
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
