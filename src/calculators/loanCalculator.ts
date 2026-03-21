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

    // Build a lookup map: "YYYY-MM" -> total special repayment amount
    const repaymentMap = new Map<string, number>();
    for (const ev of config.specialRepayments ?? []) {
      const key = ev.date.slice(0, 7);
      repaymentMap.set(key, (repaymentMap.get(key) ?? 0) + ev.amount);
    }

    let remainingDebt = config.principal;
    let paidOff = false;

    for (let i = 0; i < ctx.totalMonths; i++) {
      const current = addMonths(base, i);

      if (compareYm(current, loanStart) < 0 || compareYm(current, loanEnd) > 0 || paidOff) {
        result.push({ year: current.year, month: current.month, amount: 0 });
        continue;
      }

      // Apply regular monthly payment (interest + principal)
      if (monthlyRate > 0) {
        remainingDebt = remainingDebt * (1 + monthlyRate) - monthlyPayment;
      } else {
        remainingDebt -= monthlyPayment;
      }
      remainingDebt = Math.max(0, remainingDebt);

      // Apply special repayment for this month (期間短縮型: keep same payment, shorten term)
      const key = `${current.year}-${String(current.month).padStart(2, "0")}`;
      const extraRepayment = repaymentMap.has(key)
        ? Math.min(repaymentMap.get(key)!, remainingDebt)
        : 0;
      if (extraRepayment > 0) {
        remainingDebt = Math.max(0, remainingDebt - extraRepayment);
      }

      if (remainingDebt <= 0) {
        paidOff = true;
      }

      result.push({
        year: current.year,
        month: current.month,
        amount: -(monthlyPayment + extraRepayment),
        balance: -remainingDebt, // negative: outstanding liability
      });
    }

    return result;
  },
};
