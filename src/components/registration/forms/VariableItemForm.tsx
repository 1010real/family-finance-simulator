import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { VariableItemConfig } from "@/types/itemConfig";

type FormValue = Omit<VariableItemConfig, "id" | "name" | "type" | "color">;

interface Props {
  value: FormValue;
  onChange: (value: FormValue) => void;
}

export default function VariableItemForm({ value, onChange }: Props) {
  function update(partial: Partial<FormValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>初期金額（円）</Label>
          <Input
            type="number"
            min={0}
            value={value.initialAmount}
            onChange={(e) => update({ initialAmount: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>年間変化率（%）</Label>
          <Input
            type="number"
            step={0.1}
            value={(value.annualChangeRate * 100).toFixed(1)}
            onChange={(e) =>
              update({ annualChangeRate: Number(e.target.value) / 100 })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>開始日</Label>
          <Input
            type="month"
            value={value.startDate.slice(0, 7)}
            onChange={(e) => update({ startDate: e.target.value + "-01" })}
          />
        </div>
        <div className="space-y-2">
          <Label>終了日（任意）</Label>
          <Input
            type="month"
            value={value.endDate ? value.endDate.slice(0, 7) : ""}
            onChange={(e) =>
              update({ endDate: e.target.value ? e.target.value + "-01" : null })
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={value.isExpense}
          onCheckedChange={(checked) => update({ isExpense: checked })}
        />
        <Label>{value.isExpense ? "支出" : "収入"}</Label>
      </div>
    </div>
  );
}
