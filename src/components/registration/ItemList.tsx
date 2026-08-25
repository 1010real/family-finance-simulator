import { useState } from "react";
import ItemCard from "./ItemCard";
import type { ItemConfig } from "@/types/itemConfig";
import { cn } from "@/lib/utils";

interface Props {
  items: ItemConfig[];
  onUpdate: (item: ItemConfig) => void;
  onDelete: (id: string) => void;
  onAdd: (item: ItemConfig) => void;
  onReorder: (items: ItemConfig[]) => void;
}

export default function ItemList({ items, onUpdate, onDelete, onAdd, onReorder }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  // HTML5 DnD requires `draggable` on the dragged element itself, so it is only
  // enabled while the pointer is held on the grip handle. Otherwise buttons and
  // the color swatch would start drags too.
  const [handleHeld, setHandleHeld] = useState(false);

  function reset() {
    setDragIndex(null);
    setOverIndex(null);
    setHandleHeld(false);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex !== null && dragIndex !== targetIndex) {
      const next = [...items];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      onReorder(next);
    }
    reset();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        項目がまだありません。「項目を追加」から登録してください。
      </div>
    );
  }

  const usedColors = items.map((i) => i.color);

  return (
    <div className="space-y-2" onMouseUp={() => setHandleHeld(false)}>
      {items.map((item, index) => {
        const isDragging = dragIndex === index;
        const isDropTarget =
          overIndex === index && dragIndex !== null && dragIndex !== index;

        return (
          <div
            key={item.id}
            draggable={handleHeld}
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(index);
            }}
            onDragEnd={reset}
            className={cn(
              "rounded-lg transition-opacity",
              isDragging && "opacity-40",
              isDropTarget && "ring-2 ring-primary"
            )}
          >
            <ItemCard
              item={item}
              usedColors={usedColors}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAdd={onAdd}
              onHandlePress={() => setHandleHeld(true)}
            />
          </div>
        );
      })}
    </div>
  );
}
