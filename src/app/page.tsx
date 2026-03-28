"use client"
import { useState } from "react"
import { useMonth } from "@/contexts/MonthContext"
import { getMonthlySummary, getMonthTransactions } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { getIcon } from "@/lib/icons"
import MonthSelector from "@/components/MonthSelector"
import DonutChart from "@/components/DonutChart"
import MonthlyBarChart from "@/components/MonthlyBarChart"
import TransactionList from "@/components/TransactionList"
import CategoryLineChart from "@/components/CategoryLineChart"
import { MonthlySummary } from "@/lib/types"
import { ChevronDown } from "lucide-react"

type ViewMode = 'monthly' | 'yearly'

function getYearlySummary(year: number): MonthlySummary {
  let income = 0, personalExpense = 0, corporateExpense = 0
  const byCatMap = new Map<string, { name: string; amount: number; color: string; icon: string }>()

  for (let m = 1; m <= 12; m++) {
    const s = getMonthlySummary(year, m)
    income += s.income
    personalExpense += s.personalExpense
    corporateExpense += s.corporateExpense
    s.byCategory.forEach(c => {
      const existing = byCatMap.get(c.categoryId)
      if (existing) { existing.amount += c.amount }
      else { byCatMap.set(c.categoryId, { ...c }) }
    })
  }

  const totalExpense = personalExpense + corporateExpense
  const balance = income - totalExpense
  const savingsRate = income > 0 ? (balance / income) * 100 : 0
  const byCategory = Array.from(byCatMap.entries())
    .map(([categoryId, data]) => ({ categoryId, ...data }))
    .sort((a, b) => b.amount - a.amount)

  return { income, personalExpense, corporateExpense, totalExpense, balance, savingsRate, byCategory }
}

export default function HomePage() {
  const { year, month } = useMonth()
  const [view, setView] = useState<ViewMode>('monthly')
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)

  const monthlySummary = getMonthlySummary(year, month)
  const yearlySummary = getYearlySummary(year)
  const summary = view === 'monthly' ? monthlySummary : yearlySummary
  const transactions = getMonthTransactions(year, month)

  return (
    <div>
      <MonthSelector />

      <div className="mx-4 mt-3 flex bg-gray-100 rounded-xl p-1">
        <button onClick={() => { setView('monthly'); setSelectedCatId(null) }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'monthly' ? 'bg-white text-[#2B95ED] shadow-sm' : 'text-gray-400'}`}>
          {month}月
        </button>
        <button onClick={() => { setView('yearly'); setSelectedCatId(null) }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'yearly' ? 'bg-white text-[#2B95ED] shadow-sm' : 'text-gray-400'}`}>
          {year}年 年間
        </button>
      </div>

      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <h2 className="text-xs font-bold text-gray-500 mb-3">{view === 'monthly' ? '今月の収支' : `${year}年 年間収支`}</h2>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">収入</span>
          <span className="text-lg font-bold text-[#2B95ED] tabular-nums">{formatCurrency(summary.income)}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">支出</span>
          <span className="text-lg font-bold text-[#F44E5E] tabular-nums">{formatCurrency(summary.totalExpense)}</span>
        </div>
        <div className="border-t border-gray-100 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-700">収支</span>
          <span className={`text-xl font-bold tabular-nums ${summary.balance >= 0 ? 'text-[#4CAF50]' : 'text-[#F44E5E]'}`}>
            {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">貯蓄率</span>
          <span className={`text-sm font-bold tabular-nums ${summary.savingsRate >= 0 ? 'text-[#4CAF50]' : 'text-[#F44E5E]'}`}>
            {summary.savingsRate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <h2 className="text-xs font-bold text-gray-500 mb-2">支出内訳</h2>
        <DonutChart summary={summary} />
        <div className="flex justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F44E5E]" />
            <span className="text-[11px] text-gray-600">個人支出</span>
            <span className="text-[11px] font-bold text-gray-800 tabular-nums">{formatCurrency(summary.personalExpense)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF9800]" />
            <span className="text-[11px] text-gray-600">法人経費</span>
            <span className="text-[11px] font-bold text-gray-800 tabular-nums">{formatCurrency(summary.corporateExpense)}</span>
          </div>
        </div>
      </div>

      {view === 'yearly' && (
        <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
          <h2 className="text-xs font-bold text-gray-500 mb-2">月別推移</h2>
          <MonthlyBarChart year={year} />
        </div>
      )}

      {view === 'yearly' && summary.byCategory.length > 0 && (
        <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-xs font-bold text-gray-500">カテゴリ別年間支出</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">タップで月別推移を表示</p>
          </div>
          {summary.byCategory.map((c, i) => {
            const pct = summary.totalExpense > 0 ? ((c.amount / summary.totalExpense) * 100) : 0
            const maxAmt = summary.byCategory[0]?.amount || 1
            const barW = (c.amount / maxAmt) * 100
            const isSelected = selectedCatId === c.categoryId
            const Icon = getIcon(c.icon)
            const monthlyAvg = c.amount / 12

            return (
              <div key={c.categoryId}>
                <button onClick={() => setSelectedCatId(isSelected ? null : c.categoryId)}
                  className={`w-full text-left px-4 py-3 transition-colors ${i > 0 ? 'border-t border-gray-50' : ''} ${isSelected ? 'bg-[#F8FBFF]' : 'active:bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.color + '22' }}>
                      <Icon size={16} color={c.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800 font-medium">{c.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-800 tabular-nums">{formatCurrency(c.amount)}</span>
                          <span className="text-[10px] text-gray-400 ml-1.5 tabular-nums">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, backgroundColor: c.color }} />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">月平均 {formatCurrency(Math.round(monthlyAvg))}</p>
                    </div>
                    <ChevronDown size={14} color="#999" className={`shrink-0 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isSelected && (
                  <div className="px-4 pb-4 bg-[#F8FBFF] animate-fade-in">
                    <CategoryLineChart year={year} categoryId={c.categoryId} color={c.color} categoryName={c.name} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {view === 'monthly' && (
        <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in mb-4">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-xs font-bold text-gray-500">最近の入出金</h2>
          </div>
          <TransactionList transactions={transactions} limit={8} />
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
