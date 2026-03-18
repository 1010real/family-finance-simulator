export interface YearMonth {
  year: number;
  month: number; // 1-12
}

export function parseYearMonth(dateStr: string): YearMonth {
  const d = new Date(dateStr + "T00:00:00");
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function addMonths(ym: YearMonth, months: number): YearMonth {
  const totalMonths = (ym.year * 12 + (ym.month - 1)) + months;
  return {
    year: Math.floor(totalMonths / 12),
    month: (totalMonths % 12) + 1,
  };
}

export function monthDiff(from: YearMonth, to: YearMonth): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function ymToIndex(ym: YearMonth, base: YearMonth): number {
  return monthDiff(base, ym);
}

export function indexToYm(index: number, base: YearMonth): YearMonth {
  return addMonths(base, index);
}

export function ymLabel(ym: YearMonth): string {
  return `${ym.year}-${String(ym.month).padStart(2, "0")}`;
}

export function compareYm(a: YearMonth, b: YearMonth): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}
