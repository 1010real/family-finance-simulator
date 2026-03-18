export type ItemType =
  | "fixed"
  | "variable"
  | "loan"
  | "investment"
  | "one-time";

export type FrequencyType = "monthly" | "annual";

interface ItemBase {
  id: string;
  name: string;
  type: ItemType;
  color: string;
}

export interface FixedItemConfig extends ItemBase {
  type: "fixed";
  amount: number;
  frequency: FrequencyType;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  isExpense: boolean;
}

export interface VariableItemConfig extends ItemBase {
  type: "variable";
  initialAmount: number;
  annualChangeRate: number; // e.g. 0.03 = 3%
  startDate: string;
  endDate: string | null;
  isExpense: boolean;
}

export interface LoanItemConfig extends ItemBase {
  type: "loan";
  principal: number;
  annualInterestRate: number;
  termMonths: number;
  startDate: string;
}

export interface InvestmentItemConfig extends ItemBase {
  type: "investment";
  initialAmount: number;
  monthlyContribution: number;
  annualInterestRate: number;
  startDate: string;
}

export interface OneTimeItemConfig extends ItemBase {
  type: "one-time";
  amount: number;
  date: string;
  isExpense: boolean;
}

export type ItemConfig =
  | FixedItemConfig
  | VariableItemConfig
  | LoanItemConfig
  | InvestmentItemConfig
  | OneTimeItemConfig;

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  fixed: "固定収支",
  variable: "変動収支",
  loan: "ローン",
  investment: "投資・貯蓄",
  "one-time": "一時収支",
};
