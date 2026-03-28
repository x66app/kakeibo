"use client"
import { Transaction, Category } from '@/lib/types'
import { getCategories } from '@/lib/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import * as Icons from 'lucide-react'
import { LucideProps } from 'lucide-react'
import { ComponentType } from 'react'

function getIcon(name: string): ComponentType<LucideProps> {
  const icon = (Icons as Record<string, ComponentType<LucideProps>>)[name]
  return icon || Icons.Circle
}

interface Props {
  transactions: Transaction[]
  limit?: number
  onItemClick?: (t: Transaction) => void
}

export default function TransactionList({ transactions, limit, onItemClick }: Props) {
  const cats = getCategories()
  const catMap = new Map<string, Category>(cats.map(c => [c.id, c]))
  const items = limit ? transactions.slice(0, limit) : transactions

  const grouped = new Map<string, Transaction[]>()
  items.forEach(t => {
    const list = grouped.get(t.date) || []
    list.push(t)
    grouped.set(t.date, list)
  })

  return (
    <div>
      {Array.from(grouped.entries()).map(([date, txs]) => (
        <div key={date}>
          <div className="px-4 py-1.5 bg-gray-50 text-xs text-gray-500 font-medium sticky top-12">
            {formatDate(date)}
          </div>
          {txs.map(t => {
            const cat = catMap.get(t.categoryId)
            const Icon = getIcon(cat?.icon || 'Circle')
            const isIncome = t.type === 'income'
            return (
              <button
                key={t.id}
                onClick={() => onItemClick?.(t)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50 transition text-left"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (cat?.color || '#999') + '22' }}
                >
                  <Icon size={18} color={cat?.color || '#999'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{cat?.name || '不明'}</p>
                  {t.memo && <p className="text-[11px] text-gray-400 truncate">{t.memo}</p>}
                </div>
                <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-[#2B95ED]' : 'text-gray-800'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
