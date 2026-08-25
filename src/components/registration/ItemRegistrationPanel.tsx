import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SetManager from "./SetManager";
import ItemList from "./ItemList";
import ItemFormDialog from "./ItemFormDialog";
import { useAppState, useAppDispatch } from "@/state/hooks";
import type { ItemConfig } from "@/types/itemConfig";

export default function ItemRegistrationPanel() {
  const { items } = useAppState();
  const dispatch = useAppDispatch();
  const [addOpen, setAddOpen] = useState(false);

  function handleAdd(item: ItemConfig) {
    dispatch({ type: "ADD_ITEM", payload: item });
  }

  function handleUpdate(item: ItemConfig) {
    dispatch({ type: "UPDATE_ITEM", payload: item });
  }

  function handleDelete(id: string) {
    dispatch({ type: "DELETE_ITEM", payload: { id } });
  }

  function handleReorder(reordered: ItemConfig[]) {
    dispatch({ type: "REORDER_ITEMS", payload: reordered });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold">家計項目</h1>
        <p className="text-xs text-muted-foreground mt-0.5">収支項目を登録してシミュレーション</p>
      </div>

      <div className="p-4 border-b border-border">
        <SetManager />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            登録済み項目 <span className="text-muted-foreground">({items.length}件)</span>
          </span>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            項目を追加
          </Button>
        </div>

        <Separator />

        <ItemList
          items={items}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onReorder={handleReorder}
        />
      </div>

      <ItemFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onConfirm={handleAdd}
        usedColors={items.map((i) => i.color)}
      />
    </div>
  );
}
