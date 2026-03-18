import { cn } from "@/lib/utils";
import ItemRegistrationPanel from "@/components/registration/ItemRegistrationPanel";

export default function PanelA() {
  return (
    <div
      className={cn(
        "flex flex-col w-[420px] min-w-[320px] max-w-[520px] h-full",
        "border-r border-border bg-background",
        "overflow-y-auto"
      )}
    >
      <ItemRegistrationPanel />
    </div>
  );
}
