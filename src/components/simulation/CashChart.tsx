import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { SimulationResult } from "@/types/simulation";
import type { ViewMode } from "@/types/storage";
import { formatShortNumber } from "@/lib/formatters";
import { buildChartData, CASH_KEY } from "./SimulationChart";

interface Props {
  result: SimulationResult;
  viewMode: ViewMode;
}

export default function CashChart({ result, viewMode }: Props) {
  const data = buildChartData(result, viewMode);
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 24, left: 16, bottom: 40 }}>
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
          tickFormatter={formatShortNumber}
          tick={{ fontSize: 11 }}
          width={72}
          className="fill-muted-foreground"
        />
        <Tooltip
          formatter={(value: number) => [formatShortNumber(value), "手元キャッシュ"]}
          labelClassName="font-medium"
          contentStyle={{ fontSize: 13 }}
        />
        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={2} />
        <Area
          type="monotone"
          dataKey={CASH_KEY}
          name="手元キャッシュ"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
