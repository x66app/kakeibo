"use client";
import { useState } from "react";
import MonthSelector from "@/components/MonthSelector";
import { useMonth } from "@/contexts/MonthContext";
import { useTransactions, useYearTransactions, useCategories } from "@/hooks/useSheets";
import DonutChart from "@/components/DonutChart";
import MonthlyBarChart from "@/components/MonthlyBarChart";
import CategoryLineChart from "@/components/CategoryLineChart";
import TransactionList from "@/components/TransactionList";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const { year, month } = useMonth();
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const { categories } = useCategories();

  // 月次データ
  const { transactions, summary, loading } = useTransactions(year, month);
  // 年次データ
  const { monthlySummaries, yearSummary, loading: yearLoading } = useYearTransactions(year);

  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (loading && viewMode === "monthly") {
    return (
      <div className="pb-28 px-4 pt-2 max-w-lg mx-auto">
        <MonthSelector />
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // カテゴリ色取得
  const getCatColor = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat?.color || "#9E9E9E";
  };

  // 月次ビュー
  const renderMonthly = () => {
    const donutSummary = {
      income: summary.income,
      personalExpense: summary.personalExpense,
      corporateExpense: summary.corporateExpense,
      totalExpense: summary.totalExpense,
      balance: summary.balance,
      savingsRate: summary.savingsRate,
      byCategory: summary.byCategory.filter(c => c.type === "expense").map(c => {
        const cat = categories.find(ca => ca.id === c.categoryId);
        return { categoryId: c.categoryId, name: c.categoryName, amount: c.amount, color: cat?.color || "#9E9E9E", icon: cat?.icon || "Zap" };
      }),
    };

    const recentTx = [...transactions]
      .filter(t => t.type !== "income")
      .sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""))
      .slice(0, 10);

    

    return (
      <>
        {/* サマリカード */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500">収入</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(summary.income)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">支出</p>
              <p className="text-lg font-bold text-red-500">{formatCurrency(summary.totalExpense)}</p>
            </div>
          </div>
          <div className="border-t pt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">収支</p>
              <p className={`text-lg font-bold ${summary.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">貯蓄率</p>
              <p className="text-lg font-bold text-gray-800">{summary.savingsRate}%</p>
            </div>
          </div>
        </div>

        {/* ドーナツ */}
        {donutSummary.byCategory.length > 0 && <DonutChart summary={donutSummary} />}

        {/* 最近の支出 */}
        {recentTx.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">最近の支出</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {recentTx.map((tx, idx) => {
                const cat = categories.find(c => c.id === tx.categoryId);
                const Icon = getIcon(cat?.icon || "Zap");
                return (
                  <div key={(tx.id || "") + idx} className="flex items-center px-4 py-3 border-b last:border-b-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: (cat?.color || "#9E9E9E") + "22" }}>
                      <Icon size={16} style={{ color: cat?.color || "#9E9E9E" }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{tx.categoryName}</p>
                      <p className="text-xs text-gray-400">{tx.date}{tx.memo ? ` · ${tx.memo}` : ""}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">-{formatCurrency(tx.amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  // 年次ビュー
  const renderYearly = () => {
    if (yearLoading) {
      return (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    const barData = monthlySummaries.map(m => ({
      name: `${m.month}月`,
      income: m.income,
      expense: m.expense,
    }));

    const expenseCategories = yearSummary.byCategory.filter(c => c.type === "expense");
    const totalExp = yearSummary.totalExpense || 1;

    return (
      <>
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500">年間収入</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(yearSummary.income)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">年間支出</p>
              <p className="text-lg font-bold text-red-500">{formatCurrency(yearSummary.totalExpense)}</p>
            </div>
          </div>
          <div className="border-t pt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">年間収支</p>
              <p className={`text-lg font-bold ${yearSummary.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {formatCurrency(yearSummary.balance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">貯蓄率</p>
              <p className="text-lg font-bold text-gray-800">{yearSummary.savingsRate}%</p>
            </div>
          </div>
        </div>

        {/* 月別推移 */}
        <MonthlyBarChart year={year} />

        {/* カテゴリランキング */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">カテゴリ別支出</h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {expenseCategories.map(c => {
              const pct = Math.round((c.amount / totalExp) * 100);
              const cat = categories.find(ca => ca.id === c.categoryId);
              const Icon = getIcon(cat?.icon || "Zap");
              const color = cat?.color || "#9E9E9E";
              const isExpanded = expandedCat === c.categoryId;
              return (
                <div key={c.categoryId}>
                  <div className="flex items-center px-4 py-3 border-b cursor-pointer"
                    onClick={() => setExpandedCat(isExpanded ? null : c.categoryId)}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: color + "22" }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm text-gray-800">{c.categoryName}</p>
                        <p className="text-sm font-semibold">{formatCurrency(c.amount)}</p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 w-10 text-right">{pct}%</span>
                  </div>
                  {isExpanded && (() => {
                    const monthlyAmounts = monthlySummaries.map(ms => {
                      const mc = (ms.byCategory || []).find((bc: any) => bc.categoryId === c.categoryId);
                      return mc?.amount || 0;
                    });
                    const activeMonths = monthlyAmounts.filter(a => a > 0).length || 1;
                    const avg = Math.round(c.amount / activeMonths);
                    const maxAmt = Math.max(...monthlyAmounts, 1);
                    return (
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <p className="text-xs font-semibold text-gray-500 mb-3">月平均: {formatCurrency(avg)}</p>
                        <div className="relative mb-3" style={{ height: 180 }}>
                          <svg viewBox="0 0 320 180" className="w-full h-full">
                            {/* Y軸ラベル・グリッド */}
                            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                              const y = 150 - r * 130;
                              const val = Math.round(maxAmt * r);
                              const label = val >= 10000 ? `${Math.round(val / 10000)}万` : val >= 1000 ? `${(val / 1000).toFixed(0)}千` : String(val);
                              return (
                                <g key={i}>
                                  <line x1="40" y1={y} x2="310" y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
                                  <text x="36" y={y + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{label}</text>
                                </g>
                              );
                            })}
                            {/* 折れ線 */}
                            <polyline
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                              strokeLinejoin="round"
                              points={monthlyAmounts.map((a, i) => `${45 + i * (265 / 11)},${150 - (a / maxAmt) * 130}`).join(" ")}
                            />
                            {/* データポイント + X軸ラベル */}
                            {monthlyAmounts.map((a, i) => {
                              const x = 45 + i * (265 / 11);
                              const y = 150 - (a / maxAmt) * 130;
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r={a > 0 ? "3.5" : "2"} fill={a > 0 ? color : "#ddd"} />
                                  <text x={x} y={168} textAnchor="middle" fontSize="8" fill="#9ca3af">{i + 1}月</text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                        <div className="space-y-1">
                          {monthlySummaries.map((ms, mi) => {
                            const amt = monthlyAmounts[mi];
                            return (
                              <div key={mi} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                                <span className="text-xs text-gray-500 w-8">{mi + 1}月</span>
                                <div className="flex-1 mx-2">
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${maxAmt > 0 ? (amt / maxAmt) * 100 : 0}%`, backgroundColor: color }} />
                                  </div>
                                </div>
                                <span className={`text-xs font-bold w-20 text-right ${amt > 0 ? "text-gray-800" : "text-gray-300"}`}>{amt > 0 ? formatCurrency(amt) : "-"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-lg mx-auto">
      <MonthSelector />

      {/* 切替タブ */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setViewMode("monthly")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${viewMode === "monthly" ? "bg-blue-500 text-white" : "bg-white text-gray-600 border"}`}>
          {month}月
        </button>
        <button onClick={() => setViewMode("yearly")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${viewMode === "yearly" ? "bg-blue-500 text-white" : "bg-white text-gray-600 border"}`}>
          {year}年 年間
        </button>
      </div>

      {viewMode === "monthly" ? renderMonthly() : renderYearly()}
    </div>
  );
}













