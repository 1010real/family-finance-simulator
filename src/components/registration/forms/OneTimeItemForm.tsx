import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { OneTimeItemConfig } from "@/types/itemConfig";

type FormValue = Omit<OneTimeItemConfig, "id" | "name" | "type" | "color">;

interface Props {
  value: FormValue;
  onChange: (value: FormValue) => void;
}

export default function OneTimeItemForm({ value, onChange }: Props) {
  function update(partial: Partial<FormValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>金額（円）</Label>
          <Input
            type="number"
            min={0}
            value={value.amount}
            onChange={(e) => update({ amount: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>発生月</Label>
          <Input
            type="month"
            value={value.date.slice(0, 7)}
            onChange={(e) => update({ date: e.target.value + "-01" })}
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
