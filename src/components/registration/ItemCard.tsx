import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ItemFormDialog from "./ItemFormDialog";
import type { ItemConfig } from "@/types/itemConfig";
import { ITEM_TYPE_LABELS } from "@/types/itemConfig";
import { formatShortNumber } from "@/lib/formatters";

interface Props {
  item: ItemConfig;
  itemCount: number;
  onUpdate: (item: ItemConfig) => void;
  onDelete: (id: string) => void;
}

function getItemSummary(item: ItemConfig): string {
  switch (item.type) {
    case "fixed":
      return `${formatShortNumber(item.amount)} / ${item.frequency === "monthly" ? "月" : "年"}`;
    case "variable":
      return `${formatShortNumber(item.initialAmount)} 〜 (変化率 ${(item.annualChangeRate * 100).toFixed(1)}%/年)`;
    case "loan":
      return `${formatShortNumber(item.principal)} / ${item.termMonths}ヶ月`;
    case "investment":
      return `${formatShortNumber(item.initialAmount)} + ${formatShortNumber(item.monthlyContribution)}/月`;
    case "one-time":
      return `${formatShortNumber(item.amount)} (${item.date.slice(0, 7)})`;
  }
}

export default function ItemCard({ item, itemCount, onUpdate, onDelete }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card className="group relative">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div
              className="mt-1 h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate">{item.name}</span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {ITEM_TYPE_LABELS[item.type]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{getItemSummary(item)}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ItemFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onConfirm={onUpdate}
        initialItem={item}
        itemCount={itemCount}
      />
    </>
  );
}
