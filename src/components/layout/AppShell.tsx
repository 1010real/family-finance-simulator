import { useAppState } from "@/state/hooks";
import PanelA from "./PanelA";
import PanelB from "./PanelB";

export default function AppShell() {
  const { darkMode } = useAppState();

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden bg-background text-foreground${darkMode ? " dark" : ""}`}
    >
      <PanelA />
      <PanelB />
    </div>
  );
}
