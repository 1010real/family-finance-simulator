import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemType } from "@/types/itemConfig";
import { ITEM_TYPE_LABELS } from "@/types/itemConfig";

interface ItemTypeSelectorProps {
  value: ItemType;
  onChange: (value: ItemType) => void;
}

const ITEM_TYPES: ItemType[] = ["fixed", "variable", "loan", "investment", "one-time"];

export default function ItemTypeSelector({ value, onChange }: ItemTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ItemType)}>
      <SelectTrigger>
        <SelectValue placeholder="種類を選択" />
      </SelectTrigger>
      <SelectContent>
        {ITEM_TYPES.map((type) => (
          <SelectItem key={type} value={type}>
            {ITEM_TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
