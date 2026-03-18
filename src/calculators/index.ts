import { registerCalculator } from "./registry";
import { fixedCalculator } from "./fixedCalculator";
import { variableCalculator } from "./variableCalculator";
import { loanCalculator } from "./loanCalculator";
import { investmentCalculator } from "./investmentCalculator";
import { oneTimeCalculator } from "./oneTimeCalculator";

// Register all built-in calculators
registerCalculator(fixedCalculator);
registerCalculator(variableCalculator);
registerCalculator(loanCalculator);
registerCalculator(investmentCalculator);
registerCalculator(oneTimeCalculator);

export { calculateItem } from "./registry";
export { runSimulation } from "./runSimulation";
export type { CalculatorContext } from "./types";
