import ItemCard from "./ItemCard";
import type { ItemConfig } from "@/types/itemConfig";

interface Props {
  items: ItemConfig[];
  onUpdate: (item: ItemConfig) => void;
  onDelete: (id: string) => void;
  onAdd: (item: ItemConfig) => void;
}

export default function ItemList({ items, onUpdate, onDelete, onAdd }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        項目がまだありません。「項目を追加」から登録してください。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          usedColors={items.map((i) => i.color)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}
