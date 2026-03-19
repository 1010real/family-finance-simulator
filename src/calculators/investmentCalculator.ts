import type { InvestmentItemConfig } from "@/types/itemConfig";
import type { MonthlyDataPoint } from "@/types/simulation";
import type { Calculator, CalculatorContext } from "./types";
import { addMonths, compareYm, parseYearMonth } from "@/lib/dateUtils";

export const investmentCalculator: Calculator<InvestmentItemConfig> = {
  type: "investment",

  calculate(config: InvestmentItemConfig, ctx: CalculatorContext): MonthlyDataPoint[] {
    const result: MonthlyDataPoint[] = [];
    const base = { year: ctx.startYear, month: ctx.startMonth };
    const investStart = parseYearMonth(config.startDate);
    const monthlyRate = config.annualInterestRate / 12;

    let balance = 0;

    for (let i = 0; i < ctx.totalMonths; i++) {
      const current = addMonths(base, i);

      if (compareYm(current, investStart) < 0) {
        result.push({ year: current.year, month: current.month, amount: 0 });
        continue;
      }

      if (current.year === investStart.year && current.month === investStart.month) {
        // First month: initial amount + first contribution, no interest yet
        balance = config.initialAmount + config.monthlyContribution;
        result.push({
          year: current.year,
          month: current.month,
          // Cash outflow: initial deposit + first contribution
          amount: -(config.initialAmount + config.monthlyContribution),
          balance,
        });
      } else {
        // Subsequent months: apply compound interest then add contribution
        balance = balance * (1 + monthlyRate) + config.monthlyContribution;
        result.push({
          year: current.year,
          month: current.month,
          // Cash outflow: only the monthly contribution (interest is unrealised gain)
          amount: -config.monthlyContribution,
          balance,
        });
      }
    }

    return result;
  },
};
