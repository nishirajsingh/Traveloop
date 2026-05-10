import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BudgetState {
  budgets: Record<string, number>;
  setBudget: (tripId: string, amount: number) => void;
  getBudget: (tripId: string) => number;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: {},
      setBudget: (tripId, amount) =>
        set((s) => ({ budgets: { ...s.budgets, [tripId]: amount } })),
      getBudget: (tripId) => get().budgets[tripId] ?? 0,
    }),
    { name: "traveloop-budget" }
  )
);
