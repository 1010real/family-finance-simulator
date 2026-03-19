import type { LoanItemConfig } from "@/types/itemConfig";
import type { MonthlyDataPoint } from "@/types/simulation";
import type { Calculator, CalculatorContext } from "./types";
import { addMonths, compareYm, parseYearMonth } from "@/lib/dateUtils";

export const loanCalculator: Calculator<LoanItemConfig> = {
  type: "loan",

  calculate(config: LoanItemConfig, ctx: CalculatorContext): MonthlyDataPoint[] {
    const result: MonthlyDataPoint[] = [];
    const base = { year: ctx.startYear, month: ctx.startMonth };
    const loanStart = parseYearMonth(config.startDate);
    const loanEnd = addMonths(loanStart, config.termMonths - 1);

    // Monthly payment using standard amortization formula
    const monthlyRate = config.annualInterestRate / 12;
    let monthlyPayment: number;

    if (monthlyRate === 0) {
      monthlyPayment = config.principal / config.termMonths;
    } else {
      monthlyPayment =
        (config.principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -config.termMonths));
    }

    let remainingDebt = config.principal;

    for (let i = 0; i < ctx.totalMonths; i++) {
      const current = addMonths(base, i);

      if (compareYm(current, loanStart) < 0 || compareYm(current, loanEnd) > 0) {
        result.push({ year: current.year, month: current.month, amount: 0 });
        continue;
      }

      // Reduce remaining debt by principal portion of this month's payment
      if (monthlyRate > 0) {
        remainingDebt = remainingDebt * (1 + monthlyRate) - monthlyPayment;
      } else {
        remainingDebt -= monthlyPayment;
      }
      remainingDebt = Math.max(0, remainingDebt);

      result.push({
        year: current.year,
        month: current.month,
        amount: -monthlyPayment,
        balance: -remainingDebt, // negative: outstanding liability
      });
    }

    return result;
  },
};
