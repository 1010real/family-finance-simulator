import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppState, useAppDispatch } from "@/state/hooks";
import {
  getItemSetById,
  saveItemSet,
  deleteItemSet,
  getAllItemSetSummaries,
} from "@/storage/idb/itemSetRepository";
import type { ItemSet } from "@/types/storage";
import { Separator } from "@/components/ui/separator";

export default function SetManager() {
  const { items, currentSetId, currentSetName, savedSets } = useAppState();
  const dispatch = useAppDispatch();
  const [saveAsName, setSaveAsName] = useState("");
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [saveAsDialogName, setSaveAsDialogName] = useState("");

  async function refreshSummaries() {
    const summaries = await getAllItemSetSummaries();
    dispatch({ type: "SET_SAVED_SETS_SUMMARY", payload: summaries });
  }

  async function handleLoad(id: string) {
    const set = await getItemSetById(id);
    if (set) {
      dispatch({ type: "LOAD_SET", payload: set });
    }
  }

  async function handleSave() {
    const name = saveAsName.trim() || currentSetName.trim();
    if (!name) return;

    const now = new Date().toISOString();
    const set: ItemSet = {
      id: currentSetId ?? uuidv4(),
      name,
      items,
      createdAt: now,
      updatedAt: now,
    };

    await saveItemSet(set);
    dispatch({ type: "SET_CURRENT_SET_ID", payload: set.id });
    dispatch({ type: "SET_CURRENT_SET_NAME", payload: name });
    setSaveAsName("");
    await refreshSummaries();
  }

  function openSaveAsDialog() {
    setSaveAsDialogName(currentSetName);
    setSaveAsDialogOpen(true);
  }

  async function handleSaveAsConfirm() {
    const name = saveAsDialogName.trim();
    if (!name) return;

    const now = new Date().toISOString();
    const set: ItemSet = {
      id: uuidv4(),
      name,
      items,
      createdAt: now,
      updatedAt: now,
    };

    await saveItemSet(set);
    dispatch({ type: "SET_CURRENT_SET_ID", payload: set.id });
    dispatch({ type: "SET_CURRENT_SET_NAME", payload: name });
    setSaveAsDialogOpen(false);
    await refreshSummaries();
  }

  async function handleDelete(id: string) {
    await deleteItemSet(id);
    if (currentSetId === id) {
      dispatch({ type: "SET_CURRENT_SET_ID", payload: null });
      dispatch({ type: "SET_CURRENT_SET_NAME", payload: "" });
    }
    await refreshSummaries();
  }

  return (
    <>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">保存済みセット</Label>
          <div className="flex gap-2">
            <Select
              value={currentSetId ?? ""}
              onValueChange={(v) => v && handleLoad(v)}
            >
              <SelectTrigger className="flex-1 text-sm">
                <SelectValue placeholder="セットを選択..." />
              </SelectTrigger>
              <SelectContent>
                {savedSets.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentSetId && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => currentSetId && handleDelete(currentSetId)}
                title="現在のセットを削除"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">保存</Label>
          <div className="flex gap-2">
            <Input
              placeholder={currentSetName || "セット名を入力..."}
              value={saveAsName}
              onChange={(e) => setSaveAsName(e.target.value)}
              className="flex-1 text-sm"
            />
            {currentSetId && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleSave}
                title="上書き保存"
                disabled={items.length === 0}
              >
                <Save className="h-4 w-4" />
              </Button>
            )}
          </div>
          {currentSetName && (
            <p className="text-xs text-muted-foreground">
              現在: <span className="font-medium">{currentSetName}</span>
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={openSaveAsDialog}
            disabled={items.length === 0}
          >
            別名で保存
          </Button>
        </div>
      </div>

      <Dialog open={saveAsDialogOpen} onOpenChange={setSaveAsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>別名で保存</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>セット名</Label>
            <Input
              placeholder="セット名を入力..."
              value={saveAsDialogName}
              onChange={(e) => setSaveAsDialogName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveAsConfirm()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveAsDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveAsConfirm} disabled={!saveAsDialogName.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
