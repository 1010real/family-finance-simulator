import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { LoanItemConfig } from "@/types/itemConfig";

type FormValue = Omit<LoanItemConfig, "id" | "name" | "type" | "color">;

interface Props {
  value: FormValue;
  onChange: (value: FormValue) => void;
}

export default function LoanItemForm({ value, onChange }: Props) {
  function update(partial: Partial<FormValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>借入金額（円）</Label>
          <Input
            type="number"
            min={0}
            value={value.principal}
            onChange={(e) => update({ principal: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>年利（%）</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={(value.annualInterestRate * 100).toFixed(2)}
            onChange={(e) =>
              update({ annualInterestRate: Number(e.target.value) / 100 })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>返済期間（ヶ月）</Label>
          <Input
            type="number"
            min={1}
            value={value.termMonths}
            onChange={(e) => update({ termMonths: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>開始日</Label>
          <Input
            type="month"
            value={value.startDate.slice(0, 7)}
            onChange={(e) => update({ startDate: e.target.value + "-01" })}
          />
        </div>
      </div>
    </div>
  );
}
