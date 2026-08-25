import { useRef, useState } from "react";
import { Copy, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ItemFormDialog from "./ItemFormDialog";
import { useAppDispatch } from "@/state/hooks";
import type { ItemConfig } from "@/types/itemConfig";
import { ITEM_TYPE_LABELS } from "@/types/itemConfig";
import { formatShortNumber } from "@/lib/formatters";

interface Props {
  item: ItemConfig;
  usedColors: string[];
  onUpdate: (item: ItemConfig) => void;
  onDelete: (id: string) => void;
  onAdd: (item: ItemConfig) => void;
  /** Arms drag-and-drop on the wrapping element while the grip is held */
  onHandlePress: () => void;
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

export default function ItemCard({ item, usedColors, onUpdate, onDelete, onAdd, onHandlePress }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  return (
    <>
      <Card
        className="group relative transition-shadow hover:shadow-md hover:ring-1 hover:ring-primary/40"
        onMouseEnter={() => dispatch({ type: "SET_HOVERED_ITEM", payload: item.id })}
        onMouseLeave={() => dispatch({ type: "SET_HOVERED_ITEM", payload: null })}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            {/* Drag handle — arms HTML5 dragging on the wrapper in ItemList */}
            <div
              className="mt-1 shrink-0 cursor-grab text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
              title="ドラッグして並び替え"
              onMouseDown={onHandlePress}
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Clickable color dot — triggers native color picker */}
            <div className="mt-1 shrink-0">
              <div
                className="h-4 w-4 rounded-full cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-border transition-shadow"
                style={{ backgroundColor: item.color }}
                title="クリックして色を変更"
                onClick={() => colorInputRef.current?.click()}
              />
              <input
                ref={colorInputRef}
                type="color"
                value={item.color}
                className="sr-only"
                onChange={(e) => onUpdate({ ...item, color: e.target.value })}
              />
            </div>

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
                title="複製"
                onClick={() => setDuplicateOpen(true)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
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
        usedColors={usedColors}
      />

      <ItemFormDialog
        open={duplicateOpen}
        onClose={() => setDuplicateOpen(false)}
        onConfirm={onAdd}
        duplicateFrom={item}
        usedColors={usedColors}
      />
    </>
  );
}
