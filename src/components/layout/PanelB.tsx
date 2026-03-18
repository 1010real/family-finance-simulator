import { cn } from "@/lib/utils";
import SimulationPanel from "@/components/simulation/SimulationPanel";

export default function PanelB() {
  return (
    <div className={cn("flex flex-col flex-1 h-full overflow-hidden bg-background")}>
      <SimulationPanel />
    </div>
  );
}
