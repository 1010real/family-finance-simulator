import { v4 as uuidv4 } from "uuid";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SpecialEvent } from "@/types/itemConfig";

interface Props {
  events: SpecialEvent[];
  onChange: (events: SpecialEvent[]) => void;
  label: string;
  amountLabel: string;
}

export default function SpecialEventList({ events = [], onChange, label, amountLabel }: Props) {
  function addEvent() {
    const today = new Date().toISOString().slice(0, 7) + "-01";
    onChange([...events, { id: uuidv4(), date: today, amount: 0 }]);
  }

  function removeEvent(id: string) {
    onChange(events.filter((e) => e.id !== id));
  }

  function updateEvent(id: string, partial: Partial<SpecialEvent>) {
    onChange(events.map((e) => (e.id === id ? { ...e, ...partial } : e)));
  }

  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addEvent}>
          <Plus className="h-3 w-3 mr-1" />
          追加
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground">イベントはありません</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">日付</Label>
                <Input
                  type="month"
                  value={event.date.slice(0, 7)}
                  onChange={(e) =>
                    updateEvent(event.id, { date: e.target.value + "-01" })
                  }
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">{amountLabel}</Label>
                <Input
                  type="number"
                  min={0}
                  value={event.amount}
                  onChange={(e) =>
                    updateEvent(event.id, { amount: Number(e.target.value) })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => removeEvent(event.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
