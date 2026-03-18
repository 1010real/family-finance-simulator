import { AppProvider } from "@/state/AppContext";
import AppShell from "@/components/layout/AppShell";

// Import calculators to trigger registration side-effects
import "@/calculators";

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
