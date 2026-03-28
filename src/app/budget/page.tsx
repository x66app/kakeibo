"use client"
import { useState, useMemo } from "react"
import { useTransactions, useYearTransactions, useCategories } from "@/hooks/useSheets"
import { formatCurrency } from "@/lib/utils"
import { getIcon } from "@/lib/icons"
import MonthSelector from "@/components/MonthSelector"
import DonutChart from "@/components/DonutChart"
import MonthlyBarChart from "@/components/MonthlyBarChart"
import { useMonth } from "@/contexts/MonthContext"

type Filter = 'all' | 'personal' | 'corporate'

export default function BudgetPage() {
  const { year, month } = useMonth()
  const { categories } = useCategories()
  const { summary, loading } = useTransactions(year, month)
  const [filter, setFilter] = useState<Filter>('all')

  const byCategory = useMemo(() => {
    if (!summary) return []
    let items = summary.byCategory.filter(c => c.type === "expense" && c.amount > 0)
    if (filter === 'personal') items = items.filter(c => c.group === 'personal')
    if (filter === 'corporate') items = items.filter(c => c.group === 'corporate')
    return items.sort((a, b) => b.amount - a.amount).map(c => {
      const cat = categories.find(ct => ct.id === c.categoryId)
      return { ...c, name: c.categoryName, color: cat?.color || "#9E9E9E", icon: cat?.icon || "Zap" }
    })
  }, [summary, filter, categories])

  const totalExpense = summary?.totalExpense || 0
  const maxAmount = Math.max(...byCategory.map(c => c.amount), 1)

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full" /></div>

  return (
    <div>
      <MonthSelector />

      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">収入</span>
          <span className="text-base font-bold text-[#2B95ED] tabular-nums">{formatCurrency(summary?.income || 0)}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">支出</span>
          <span className="text-base font-bold text-[#F44E5E] tabular-nums">{formatCurrency(totalExpense)}</span>
        </div>
        <div className="border-t border-gray-100 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-700">収支</span>
          <span className={`text-lg font-bold tabular-nums ${(summary?.balance || 0) >= 0 ? 'text-[#4CAF50]' : 'text-[#F44E5E]'}`}>
            {(summary?.balance || 0) >= 0 ? '+' : ''}{formatCurrency(summary?.balance || 0)}
          </span>
        </div>
      </div>

      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <h2 className="text-xs font-bold text-gray-500 mb-1">支出内訳</h2>
        {summary && <DonutChart summary={{
          ...summary,
          byCategory: summary.byCategory.filter(c => c.type === "expense").map(c => {
            const cat = categories.find(ct => ct.id === c.categoryId)
            return { ...c, name: c.categoryName, color: cat?.color || "#9E9E9E", icon: cat?.icon || "Zap" }
          })
        }} />}
      </div>

      <div className="mx-4 mt-3 flex gap-2">
        {([
          { key: 'all' as Filter, label: '全て' },
          { key: 'personal' as Filter, label: '個人支出' },
          { key: 'corporate' as Filter, label: '法人経費' },
        ]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors
              ${filter === f.key ? 'bg-[#2B95ED] text-white' : 'bg-white text-gray-500 border border-gray-200'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
        {byCategory.map((c, i) => {
          const Icon = getIcon(c.icon)
          const pct = totalExpense > 0 ? ((c.amount / totalExpense) * 100) : 0
          const barW = (c.amount / maxAmount) * 100
          return (
            <div key={c.categoryId + i} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: c.color + '22' }}>
                  <Icon size={16} color={c.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-800 font-medium">{c.name}</span>
                    <span className="text-sm font-bold text-gray-800 tabular-nums">{formatCurrency(c.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${barW}%`, backgroundColor: c.color }} />
                    </div>
                    <span className="text-[10px] text-gray-400 tabular-nums w-10 text-right">{pct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mx-4 mt-3 mb-4 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <h2 className="text-xs font-bold text-gray-500 mb-2">月次推移</h2>
        <MonthlyBarChart year={year} />
      </div>
    </div>
  )
}

