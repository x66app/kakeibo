"use client";
import { useState, useEffect, useCallback } from "react";

export interface Transaction {
  id: string;
  date: string;
  year: number;
  month: number;
  categoryId: string;
  categoryName: string;
  type: string;
  group: string;
  amount: number;
  memo: string;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
  group: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export interface MonthlySummaryData {
  income: number;
  personalExpense: number;
  corporateExpense: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  byCategory: { categoryId: string; categoryName: string; type: string; group: string; amount: number }[];
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(data => { setCategories(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return { categories, loading };
}

export function useTransactions(year: number, month: number) {
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummaryData>({
    income: 0, personalExpense: 0, corporateExpense: 0,
    totalExpense: 0, balance: 0, savingsRate: 0, byCategory: [],
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?year=${year}&month=${month}`);
      const json = await res.json();
      const mergedData = json.data || [];
      setRawTransactions(json.rawTransactions || []);

      let income = 0, personalExpense = 0, corporateExpense = 0;
      const byCategory: MonthlySummaryData["byCategory"] = [];

      mergedData.forEach((t: any) => {
        if (t.amount === 0) return;
        if (t.type === "income") income += t.amount;
        else if (t.group === "corporate") corporateExpense += t.amount;
        else personalExpense += t.amount;
        byCategory.push({ categoryId: t.categoryId, categoryName: t.categoryName, type: t.type, group: t.group, amount: t.amount });
      });

      const totalExpense = personalExpense + corporateExpense;
      const balance = income - totalExpense;
      const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

      setSummary({
        income, personalExpense, corporateExpense, totalExpense, balance, savingsRate,
        byCategory: byCategory.filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount),
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  // サマリーのカテゴリ別データを疑似取引として生成
  const summaryTransactions: Transaction[] = (summary?.byCategory || []).map((c, i) => ({
    id: `summary_${c.categoryId}`,
    date: `${year}-${String(month).padStart(2,"0")}-01`,
    year, month,
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    type: c.type,
    group: c.group,
    amount: c.amount,
    memo: "月次ベース",
    createdAt: `${year}-${String(month).padStart(2,"0")}-01T00:00:00Z`,
  }));

  // raw取引のカテゴリ分をサマリーから差し引き、合算済みリストを作る
  const allTransactions: Transaction[] = [...rawTransactions, ...summaryTransactions.filter(st =>
    !rawTransactions.some(rt => rt.categoryId === st.categoryId) || true
  ).map(st => {
    // rawに同カテゴリがあればサマリー側はベース金額(raw分を引く)
    const rawTotal = rawTransactions.filter(r => r.categoryId === st.categoryId).reduce((s, r) => s + r.amount, 0);
    const baseAmount = st.amount - rawTotal;
    if (baseAmount <= 0) return null;
    return { ...st, amount: baseAmount };
  }).filter((t): t is Transaction => t !== null)];

  return { transactions: rawTransactions, allTransactions, summary, loading, reload: load };
}

export function useYearTransactions(year: number) {
  const [monthlySummaries, setMonthlySummaries] = useState<{ month: number; income: number; expense: number; balance: number; byCategory: { categoryId: string; amount: number }[] }[]>([]);
  const [yearSummary, setYearSummary] = useState<MonthlySummaryData>({
    income: 0, personalExpense: 0, corporateExpense: 0,
    totalExpense: 0, balance: 0, savingsRate: 0, byCategory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/transactions?year=${year}`);
        const json = await res.json();
        const data = json.data || [];

        const monthMap = new Map<number, { income: number; expense: number; catMap: Map<string, number> }>();
        for (let m = 1; m <= 12; m++) monthMap.set(m, { income: 0, expense: 0, catMap: new Map() });

        let income = 0, personalExpense = 0, corporateExpense = 0;
        const catMap = new Map<string, { categoryId: string; categoryName: string; type: string; group: string; amount: number }>();

        data.forEach((t: any) => {
          if (t.amount === 0) return;
          const mm = monthMap.get(t.month);
          if (!mm) return;
          if (t.type === "income") { income += t.amount; mm.income += t.amount; }
          else {
            if (t.group === "corporate") corporateExpense += t.amount;
            else personalExpense += t.amount;
            mm.expense += t.amount;
          }
          mm.catMap.set(t.categoryId, (mm.catMap.get(t.categoryId) || 0) + t.amount);
          const key = t.categoryId;
          const existing = catMap.get(key);
          if (existing) existing.amount += t.amount;
          else catMap.set(key, { categoryId: t.categoryId, categoryName: t.categoryName, type: t.type, group: t.group, amount: t.amount });
        });

        const totalExpense = personalExpense + corporateExpense;
        const balance = income - totalExpense;
        const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
        const byCategory = Array.from(catMap.values()).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

        setMonthlySummaries(Array.from(monthMap.entries()).map(([m, v]) => ({
          month: m, income: v.income, expense: v.expense, balance: v.income - v.expense,
          byCategory: Array.from(v.catMap.entries()).map(([id, amt]) => ({ categoryId: id, amount: amt })),
        })));
        setYearSummary({ income, personalExpense, corporateExpense, totalExpense, balance, savingsRate, byCategory });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [year]);

  return { monthlySummaries, yearSummary, loading };
}

export async function addTransaction(data: {
  date: string; categoryId: string; categoryName: string;
  type: string; group: string; amount: number; memo: string;
}) {
  const res = await fetch("/api/transactions", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTransaction(id: string, data: {
  date?: string; categoryId?: string; categoryName?: string;
  type?: string; group?: string; amount?: number; memo?: string;
}) {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateSummaryAmount(year: number, month: number, categoryId: string, amount: number) {
  const res = await fetch("/api/summary", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year, month, categoryId, amount }),
  });
  return res.json();
}

export async function deleteTransaction(id: string) {
  const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  return res.json();
}



