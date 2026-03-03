export type CategoryKey =
  | "rent"
  | "groceries"
  | "restaurants"
  | "transportation"
  | "subscriptions"
  | "shopping"
  | "travel"
  | "utilities"
  | "other";

export type FinanceMonth = {
  monthLabel: string; // e.g. "Jan 2026"
  income: number;
  expensesByCategory: Record<CategoryKey, number>;
};

export const financeData = {
  currency: "USD",
  current: {
    monthLabel: "Jan 2026",
    income: 5200,
    expensesByCategory: {
      rent: 1800,
      groceries: 420,
      restaurants: 220,
      transportation: 160,
      subscriptions: 95,
      shopping: 300,
      travel: 400,
      utilities: 180,
      other: 385,
    },
  } satisfies FinanceMonth,

  previous: {
    monthLabel: "Dec 2025",
    income: 5200,
    expensesByCategory: {
      rent: 1800,
      groceries: 380,
      restaurants: 260,
      transportation: 140,
      subscriptions: 95,
      shopping: 240,
      travel: 250,
      utilities: 175,
      other: 370,
    },
  } satisfies FinanceMonth,
};