"use client"
import { useState } from "react"
import { useMonth } from "@/contexts/MonthContext"
import { getMonthlySummary } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import MonthSelector from "@/components/MonthSelector"
import DonutChart from "@/components/DonutChart"
import MonthlyBarChart from "@/components/MonthlyBarChart"
import * as Icons from "lucide-react"
import { LucideProps } from "lucide-react"
import { ComponentType } from "react"

function getIcon(name: string): ComponentType<LucideProps> {
  const icon = (Icons as Record<string, ComponentType<LucideProps>>)[name]
  return icon || Icons.Circle
}

type Filter = 'all' | 'personal_expense' | 'corporate_expense'

export default function BudgetPage() {
  const { year, month } = useMonth()
  const summary = getMonthlySummary(year, month)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all'
    ? summary.byCategory
    : summary.byCategory.filter(c => {
        if (filter === 'personal_expense') {
          return !['c18', 'c19', 'c20'].includes(c.categoryId) &&
            !c.categoryId.startsWith('corporate')
        }
        return ['c18', 'c19', 'c20'].includes(c.categoryId)
      })

  // 個人/法人をちゃんと判定するため store から categories を取得
  const allCats = require('@/lib/store').getCategories()
  const filteredByType = filter === 'all'
    ? summary.byCategory
    : summary.byCategory.filter(c => {
        const cat = allCats.find((ca: { id: string; type: string }) => ca.id === c.categoryId)
        return cat?.type === filter
      })

  const maxAmount = Math.max(...filteredByType.map(c => c.amount), 1)

  return (
    <div>
      <MonthSelector />

      {/* 収支サマリー */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">収入</span>
          <span className="text-base font-bold text-[#2B95ED] tabular-nums">{formatCurrency(summary.income)}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">支出</span>
          <span className="text-base font-bold text-[#F44E5E] tabular-nums">{formatCurrency(summary.totalExpense)}</span>
        </div>
        <div className="border-t border-gray-100 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-700">収支</span>
          <span className={`text-lg font-bold tabular-nums ${summary.balance >= 0 ? 'text-[#4CAF50]' : 'text-[#F44E5E]'}`}>
            {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance)}
          </span>
        </div>
      </div>

      {/* 円グラフ */}
      <div className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <h2 className="text-xs font-bold text-gray-500 mb-1">支出内訳</h2>
        <DonutChart summary={summary} />
      </div>

      {/* フィルタ */}
      <div className="mx-4 mt-3 flex gap-2">
        {([
          { key: 'all', label: '全て' },
          { key: 'personal_expense', label: '個人支出' },
          { key: 'corporate_expense', label: '法人経費' },
        ] as { key: Filter; label: string }[]).map(f => (
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

      {/* カテゴリ別一覧 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
        {filteredByType.map((c, i) => {
          const Icon = getIcon(c.icon)
          const pct = summary.totalExpense > 0 ? ((c.amount / summary.totalExpense) * 100) : 0
          const barW = (c.amount / maxAmount) * 100
          return (
            <div key={c.categoryId} className={`px-4 py-3 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
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

      {/* 月次推移グラフ */}
      <div className="mx-4 mt-3 mb-4 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
        <h2 className="text-xs font-bold text-gray-500 mb-2">月次推移</h2>
        <MonthlyBarChart year={year} />
      </div>
    </div>
  )
}
