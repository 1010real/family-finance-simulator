import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { InvestmentItemConfig } from "@/types/itemConfig";
import SpecialEventList from "./SpecialEventList";

type FormValue = Omit<InvestmentItemConfig, "id" | "name" | "type" | "color">;

interface Props {
  value: FormValue;
  onChange: (value: FormValue) => void;
}

export default function InvestmentItemForm({ value, onChange }: Props) {
  function update(partial: Partial<FormValue>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>初期投資額（円）</Label>
          <Input
            type="number"
            min={0}
            value={value.initialAmount}
            onChange={(e) => update({ initialAmount: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>月次積立額（円）</Label>
          <Input
            type="number"
            min={0}
            value={value.monthlyContribution}
            onChange={(e) =>
              update({ monthlyContribution: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>年利（%）</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={(value.annualInterestRate * 100).toFixed(1)}
            onChange={(e) =>
              update({ annualInterestRate: Number(e.target.value) / 100 })
            }
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>積立 開始月<span className="ml-1 text-xs text-muted-foreground">（未設定 = 投資開始月）</span></Label>
          <Input
            type="month"
            value={value.contributionStartDate ? value.contributionStartDate.slice(0, 7) : ""}
            onChange={(e) =>
              update({ contributionStartDate: e.target.value ? e.target.value + "-01" : null })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>積立 終了月<span className="ml-1 text-xs text-muted-foreground">（未設定 = 終了なし）</span></Label>
          <Input
            type="month"
            value={value.contributionEndDate ? value.contributionEndDate.slice(0, 7) : ""}
            onChange={(e) =>
              update({ contributionEndDate: e.target.value ? e.target.value + "-01" : null })
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={value.includeInitialInCashFlow}
          onCheckedChange={(checked) =>
            update({ includeInitialInCashFlow: checked })
          }
        />
        <Label className="leading-snug">
          初期投資額を初月のキャッシュフローに反映する
        </Label>
      </div>

      <SpecialEventList
        events={value.specialWithdrawals}
        onChange={(events) => update({ specialWithdrawals: events })}
        label="一部引き出しイベント"
        amountLabel="引き出し額（円）"
      />
    </div>
  );
}
