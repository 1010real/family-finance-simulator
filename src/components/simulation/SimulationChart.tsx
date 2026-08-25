import { useMemo } from "react";
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
/** Key used for the cumulative running cash balance */
export const CASH_KEY = "__cash__";
/** Suffix appended to itemId for background balance/debt area keys */
export const BG_SUFFIX = "_bg";

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface TooltipEntry {
  key: string;
  label: string;
  value: string;
  color: string;
  valueColor: string;
}

interface CustomTooltipProps {
  result: SimulationResult;
  // injected by Recharts when cloning the element
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number | string; color?: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label, result }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const entries = payload
    .map((entry): TooltipEntry | null => {
      const dataKey = String(entry.dataKey ?? "");
      const value = Number(entry.value ?? 0);

      if (value === 0) return null;

      const flowColor = value >= 0 ? "text-blue-600" : "text-red-600";

      if (dataKey === TOTAL_KEY) {
        return { key: dataKey, label: "収支合計", value: formatShortNumber(value), color: entry.color ?? "", valueColor: flowColor };
      }

      if (dataKey === CASH_KEY) {
        return { key: dataKey, label: "手元キャッシュ", value: formatShortNumber(value), color: "white", valueColor: "text-green-600" };
      }

      if (dataKey.endsWith(BG_SUFFIX)) {
        const itemId = dataKey.slice(0, -BG_SUFFIX.length);
        const item = result.items.find((i) => i.itemId === itemId);
        const itemLabel = item ? `${item.itemName}（${item.balanceLabel}）` : dataKey;
        const balanceColor = item?.balanceLabel === "残高" ? "text-green-600" : "text-orange-500";
        return { key: dataKey, label: itemLabel, value: formatShortNumber(Math.abs(value)), color: entry.color ?? "", valueColor: balanceColor };
      }

      const item = result.items.find((i) => i.itemId === dataKey);
      if (!item) return null;
      return { key: dataKey, label: item.itemName, value: formatShortNumber(value), color: entry.color ?? "", valueColor: flowColor };
    })
    .filter((e): e is TooltipEntry => e !== null);

  if (!entries.length) return null;

  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1.5 font-medium">{label}</p>
      {entries.map((e) => (
        <div key={e.key} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-muted-foreground">{e.label}:</span>
          <span className={`ml-auto pl-4 font-medium tabular-nums ${e.valueColor}`}>{e.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  result: SimulationResult;
  viewMode: ViewMode;
  /** When set, every series except this item's is dimmed */
  hoveredItemId?: string | null;
}

/**
 * Opacity applied to series that are not the hovered one. Kept high enough that
 * the rest of the chart still reads as context rather than disappearing.
 */
const DIM_OPACITY = 0.35;
/** Floor for dimmed area outlines so their shape stays traceable */
const DIM_STROKE_FLOOR = 0.22;

// ---------------------------------------------------------------------------
// Y-axis zero-alignment helpers
// ---------------------------------------------------------------------------

/**
 * Generates "nice" round tick values covering [-absMax, +absMax] and always including 0.
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

  if (!ticks.includes(0)) {
    ticks.push(0);
    ticks.sort((a, b) => a - b);
  }

  return ticks;
}

/**
 * Computes symmetric axis domains for left (flow) and right (balance) axes.
 * Both axes use [-absMax, +absMax] so ¥0 is always at the vertical center,
 * and the two zero lines are guaranteed to overlap.
 */
function computeAlignedDomains(
  data: ChartDataPoint[],
  result: SimulationResult
): { left: [number, number]; right: [number, number] } {
  let lAbs = 0, rAbs = 0;

  for (const point of data) {
    let posFlow = 0, negFlow = 0;
    let posBalance = 0, negBalance = 0;
    for (const item of result.items) {
      const v = (point[item.itemId] as number) ?? 0;
      // Accumulate stacked sums to account for stackOffset="sign"
      if (v >= 0) posFlow += v; else negFlow += v;

      if (item.isBalanceItem) {
        const bg = (point[item.itemId + BG_SUFFIX] as number) ?? 0;
        if (bg >= 0) posBalance += bg; else negBalance += bg;
      }
    }
    const cash = (point[CASH_KEY] as number) ?? 0;
    if (cash >= 0) posBalance += cash; else negBalance += cash;
    lAbs = Math.max(lAbs, posFlow, Math.abs(negFlow));
    rAbs = Math.max(rAbs, posBalance, Math.abs(negBalance));
  }

  // 10% padding then ceil to a nice round number so ticks land cleanly
  const lRaw = lAbs * 1.1 || 1;
  const rRaw = rAbs * 1.1 || 1;

  function ceilNice(v: number): number {
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    const step = ([1, 2, 5, 10] as const).map((f) => mag * f).find((s) => s >= v) ?? mag * 10;
    return step;
  }

  const lMax = ceilNice(lRaw);
  const rMax = ceilNice(rRaw);

  return {
    left: [-lMax, lMax],
    right: [-rMax, rMax],
  };
}

// ---------------------------------------------------------------------------
// Chart data builder
// ---------------------------------------------------------------------------

/**
 * Rounds a balance for charting, mapping "no balance" to null.
 *
 * Balance areas share one stack under stackOffset="sign", which sorts series by
 * `value >= 0` — so a zero lands on the POSITIVE side and gets drawn at the top
 * of the cash + investment stack. For a loan whose debt has been repaid that
 * paints a stray line far up in the positive region. Returning null instead
 * makes Recharts treat the point as a break (Area.getComposedData checks the
 * raw value for null when stacked) so nothing is drawn for that period.
 *
 * `rounded === 0` also catches -0, which would otherwise still stack positive.
 */
function balanceOrNull(balance: number | undefined): number | null {
  const rounded = Math.round(balance ?? 0);
  return rounded === 0 ? null : rounded;
}

export function buildChartData(result: SimulationResult, viewMode: ViewMode): ChartDataPoint[] {
  if (result.items.length === 0) return [];
  if (result.simulatedMonths === 0) return [];
  const firstItem = result.items[0];
  if (!firstItem) return [];

  if (viewMode === "monthly") {
    let runningCash = 0;
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
          point[item.itemId + BG_SUFFIX] = balanceOrNull(d?.balance);
        }
      }
      point[TOTAL_KEY] = Math.round(total);
      runningCash += total;
      point[CASH_KEY] = Math.round(runningCash);
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
        point[item.itemId + BG_SUFFIX] = balanceOrNull(dp.balance);
      }

      yearTotals.set(dp.year, (yearTotals.get(dp.year) ?? 0) + dp.amount);
    }
  }

  const sorted = Array.from(yearMap.values()).sort((a, b) =>
    String(a.label).localeCompare(String(b.label))
  );
  let runningCash = 0;
  for (const point of sorted) {
    const yearTotal = yearTotals.get(Number(point.label)) ?? 0;
    point[TOTAL_KEY] = Math.round(yearTotal);
    runningCash += yearTotal;
    point[CASH_KEY] = Math.round(runningCash);
  }
  return sorted;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SimulationChart({ result, viewMode, hoveredItemId }: Props) {
  const data = buildChartData(result, viewMode);
  const balanceItems = result.items.filter((i) => i.isBalanceItem);
  // Right axis is always shown: cash balance is rendered there even when no loan/investment items exist
  const hasRightAxis = true;

  // Only dim when the hovered item is actually charted
  const emphasis = hoveredItemId && result.items.some((i) => i.itemId === hoveredItemId);
  /** 1 when nothing is hovered or this series is the hovered one, dimmed otherwise */
  const emphasisFactor = (itemId: string | null) =>
    !emphasis || itemId === hoveredItemId ? 1 : DIM_OPACITY;

  // useMemo で要素を安定させる。毎レンダリングで新しい要素を渡すと
  // Recharts が「content が変わった」と判断して再マウントし、
  // 前のツールチップ内容が残り続ける問題が起きる。
  const tooltipContent = useMemo(() => <CustomTooltip result={result} />, [result]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="text-lg font-medium">データがありません</p>
        <p className="text-sm mt-1">左パネルで家計項目を追加してください</p>
      </div>
    );
  }

  const domains = computeAlignedDomains(data, result);
  const leftTicks = niceTicks(domains.left[0], domains.left[1]);
  const rightTicks = niceTicks(domains.right[0], domains.right[1]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        stackOffset="sign"
        margin={{ top: 16, right: hasRightAxis ? 80 : 24, left: 16, bottom: 40 }}
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
          domain={domains.left}
          ticks={leftTicks}
          className="fill-muted-foreground"
        />

        {/* Right axis — cumulative balance / remaining debt / cash areas */}
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={formatShortNumber}
          tick={{ fontSize: 11 }}
          width={72}
          domain={domains.right}
          ticks={rightTicks}
          className="fill-muted-foreground"
        />

        <Tooltip content={tooltipContent} />

        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" strokeWidth={2} />

        {/*
          Background areas rendered FIRST so they appear behind bars in SVG paint order.
          Cash renders first within the stack → bottom layer.
          Investment balance → positive area on top of cash.
          Loan remaining debt → negative area below cash.
        */}
        <Area
          yAxisId="right"
          type="monotone"
          dataKey={CASH_KEY}
          fill="white"
          fillOpacity={0.18 * emphasisFactor(null)}
          stroke="white"
          strokeOpacity={Math.max(0.4 * emphasisFactor(null), DIM_STROKE_FLOOR)}
          strokeWidth={1}
          stackId="balance-stack"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
        {balanceItems.map((item) => {
          const isHovered = emphasis && item.itemId === hoveredItemId;
          return (
            <Area
              key={item.itemId + BG_SUFFIX}
              yAxisId="right"
              type="monotone"
              dataKey={item.itemId + BG_SUFFIX}
              fill={item.color}
              fillOpacity={isHovered ? 0.45 : 0.18 * emphasisFactor(item.itemId)}
              stroke={item.color}
              strokeOpacity={
                isHovered ? 1 : Math.max(0.4 * emphasisFactor(item.itemId), DIM_STROKE_FLOOR)
              }
              strokeWidth={isHovered ? 2 : 1}
              stackId="balance-stack"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          );
        })}

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
            fillOpacity={emphasisFactor(item.itemId)}
            stackId="stack"
            maxBarSize={20}
            isAnimationActive={false}
          />
        ))}

        {/* Net cash-flow line — sum of all monthly amounts */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey={TOTAL_KEY}
          name="収支合計"
          stroke="hsl(var(--foreground))"
          strokeOpacity={emphasisFactor(null)}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
