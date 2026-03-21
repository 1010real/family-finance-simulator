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

    // Build a lookup map: "YYYY-MM" -> total withdrawal amount
    const withdrawalMap = new Map<string, number>();
    for (const ev of config.specialWithdrawals ?? []) {
      const key = ev.date.slice(0, 7);
      withdrawalMap.set(key, (withdrawalMap.get(key) ?? 0) + ev.amount);
    }

    let balance = 0;

    for (let i = 0; i < ctx.totalMonths; i++) {
      const current = addMonths(base, i);

      if (compareYm(current, investStart) < 0) {
        result.push({ year: current.year, month: current.month, amount: 0 });
        continue;
      }

      const key = `${current.year}-${String(current.month).padStart(2, "0")}`;
      const withdrawal = withdrawalMap.has(key)
        ? Math.min(withdrawalMap.get(key)!, balance)
        : 0;

      if (current.year === investStart.year && current.month === investStart.month) {
        // First month: initial amount + first contribution, no interest yet
        balance = config.initialAmount + config.monthlyContribution - withdrawal;
        balance = Math.max(0, balance);
        // Cash flow: outflows minus any withdrawal (withdrawal is inflow = positive)
        const amount = config.includeInitialInCashFlow
          ? -(config.initialAmount + config.monthlyContribution) + withdrawal
          : -config.monthlyContribution + withdrawal;
        result.push({
          year: current.year,
          month: current.month,
          amount,
          balance,
        });
      } else {
        // Subsequent months: apply compound interest then add contribution, then subtract withdrawal
        balance = balance * (1 + monthlyRate) + config.monthlyContribution - withdrawal;
        balance = Math.max(0, balance);
        result.push({
          year: current.year,
          month: current.month,
          // Cash outflow: monthly contribution minus withdrawal received
          amount: -config.monthlyContribution + withdrawal,
          balance,
        });
      }
    }

    return result;
  },
};
