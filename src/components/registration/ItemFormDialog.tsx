import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ItemTypeSelector from "./ItemTypeSelector";
import FixedItemForm from "./forms/FixedItemForm";
import VariableItemForm from "./forms/VariableItemForm";
import LoanItemForm from "./forms/LoanItemForm";
import InvestmentItemForm from "./forms/InvestmentItemForm";
import OneTimeItemForm from "./forms/OneTimeItemForm";
import type {
  ItemConfig,
  ItemType,
  FixedItemConfig,
  VariableItemConfig,
  LoanItemConfig,
  InvestmentItemConfig,
  OneTimeItemConfig,
} from "@/types/itemConfig";
import { getNextColor } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (item: ItemConfig) => void;
  initialItem?: ItemConfig;
  itemCount: number; // used to pick color for new items
}

const TODAY = new Date().toISOString().slice(0, 7) + "-01";

function buildDefault(type: ItemType, color: string): ItemConfig {
  const base = { id: uuidv4(), name: "", color };
  switch (type) {
    case "fixed":
      return { ...base, type, amount: 0, frequency: "monthly", startDate: TODAY, endDate: null, isExpense: false };
    case "variable":
      return { ...base, type, initialAmount: 0, annualChangeRate: 0.01, startDate: TODAY, endDate: null, isExpense: false };
    case "loan":
      return { ...base, type, principal: 0, annualInterestRate: 0.01, termMonths: 120, startDate: TODAY };
    case "investment":
      return { ...base, type, initialAmount: 0, monthlyContribution: 0, annualInterestRate: 0.03, startDate: TODAY };
    case "one-time":
      return { ...base, type, amount: 0, date: TODAY, isExpense: false };
  }
}

export default function ItemFormDialog({ open, onClose, onConfirm, initialItem, itemCount }: Props) {
  const defaultColor = getNextColor(itemCount);
  const [draft, setDraft] = useState<ItemConfig>(
    initialItem ?? buildDefault("fixed", defaultColor)
  );

  // Reset draft when dialog opens
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose();
    } else {
      setDraft(initialItem ?? buildDefault("fixed", defaultColor));
    }
  }

  function handleTypeChange(type: ItemType) {
    setDraft(buildDefault(type, draft.color));
  }

  function handleConfirm() {
    if (!draft.name.trim()) return;
    onConfirm(draft);
    onClose();
  }

  function renderForm() {
    switch (draft.type) {
      case "fixed": {
        const { id: _id, name: _name, type: _type, color: _color, ...rest } = draft as FixedItemConfig;
        return (
          <FixedItemForm
            value={rest}
            onChange={(v) => setDraft({ ...(draft as FixedItemConfig), ...v })}
          />
        );
      }
      case "variable": {
        const { id: _id, name: _name, type: _type, color: _color, ...rest } = draft as VariableItemConfig;
        return (
          <VariableItemForm
            value={rest}
            onChange={(v) => setDraft({ ...(draft as VariableItemConfig), ...v })}
          />
        );
      }
      case "loan": {
        const { id: _id, name: _name, type: _type, color: _color, ...rest } = draft as LoanItemConfig;
        return (
          <LoanItemForm
            value={rest}
            onChange={(v) => setDraft({ ...(draft as LoanItemConfig), ...v })}
          />
        );
      }
      case "investment": {
        const { id: _id, name: _name, type: _type, color: _color, ...rest } = draft as InvestmentItemConfig;
        return (
          <InvestmentItemForm
            value={rest}
            onChange={(v) => setDraft({ ...(draft as InvestmentItemConfig), ...v })}
          />
        );
      }
      case "one-time": {
        const { id: _id, name: _name, type: _type, color: _color, ...rest } = draft as OneTimeItemConfig;
        return (
          <OneTimeItemForm
            value={rest}
            onChange={(v) => setDraft({ ...(draft as OneTimeItemConfig), ...v })}
          />
        );
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialItem ? "項目を編集" : "項目を追加"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>名前</Label>
            <Input
              placeholder="例：給与、家賃..."
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>種類</Label>
            <ItemTypeSelector value={draft.type} onChange={handleTypeChange} />
          </div>

          <div className="space-y-2">
            <Label>色</Label>
            <input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              className="h-10 w-full cursor-pointer rounded-md border border-input"
            />
          </div>

          {renderForm()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={!draft.name.trim()}>
            {initialItem ? "更新" : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
