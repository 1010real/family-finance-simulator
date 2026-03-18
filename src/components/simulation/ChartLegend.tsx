import type { ItemSimulationResult } from "@/types/simulation";

interface Props {
  items: ItemSimulationResult[];
}

export default function ChartLegend({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-2">
      {items.map((item) => (
        <div key={item.itemId} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="inline-block h-3 w-3 rounded-sm shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.itemName}</span>
        </div>
      ))}
    </div>
  );
}
