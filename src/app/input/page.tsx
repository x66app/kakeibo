"use client"
import { useState } from "react"
import { addTransaction } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { getIcon } from "@/lib/icons"
import { Category, TransactionType } from "@/lib/types"
import NumPad from "@/components/NumPad"
import CategorySheet from "@/components/CategorySheet"
import { CheckCircle, Calendar, Folder, ChevronDown, StickyNote } from "lucide-react"

const TYPE_TABS: { key: TransactionType; label: string; color: string }[] = [
  { key: 'income', label: '収入', color: '#2B95ED' },
  { key: 'personal_expense', label: '個人支出', color: '#F44E5E' },
  { key: 'corporate_expense', label: '法人経費', color: '#FF9800' },
]

export default function InputPage() {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const [type, setType] = useState<TransactionType>('personal_expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayStr)
  const [category, setCategory] = useState<Category | null>(null)
  const [memo, setMemo] = useState('')
  const [showCatSheet, setShowCatSheet] = useState(false)
  const [saved, setSaved] = useState(false)

  const activeTab = TYPE_TABS.find(t => t.key === type)!

  const handleTypeChange = (t: TransactionType) => {
    setType(t)
    setCategory(null)
  }

  const handleSave = () => {
    const amt = parseFloat(amount)
    if (!amt || !category) return

    addTransaction({ date, categoryId: category.id, amount: amt, memo, type })

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setAmount('')
      setMemo('')
      setCategory(null)
    }, 1200)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] animate-fade-in">
        <CheckCircle size={64} color="#4CAF50" />
        <p className="mt-4 text-lg font-bold text-gray-800">保存しました</p>
      </div>
    )
  }

  const CatIcon = category ? getIcon(category.icon) : null

  return (
    <div className="bg-white min-h-screen">
      <div className="flex border-b border-gray-100">
        {TYPE_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTypeChange(tab.key)}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${type === tab.key ? '' : 'text-gray-400'}`}
            style={{ color: type === tab.key ? tab.color : undefined }}
          >
            {tab.label}
            {type === tab.key && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ backgroundColor: tab.color }} />
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3 space-y-2.5">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
          <Calendar size={18} color="#999" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none" />
        </div>
        <button onClick={() => setShowCatSheet(true)} className="w-full flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
          {category && CatIcon ? (
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: category.color + '22' }}>
              <CatIcon size={14} color={category.color} />
            </div>
          ) : (
            <Folder size={18} color="#999" />
          )}
          <span className={`flex-1 text-left text-sm ${category ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {category ? category.name : 'カテゴリを選択'}
          </span>
          <ChevronDown size={16} color="#999" />
        </button>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
          <StickyNote size={18} color="#999" />
          <input type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="メモ（任意）"
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" />
        </div>
      </div>

      <div className="px-6 pt-4 pb-3 text-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color: activeTab.color }}>
          {amount ? formatCurrency(parseFloat(amount)) : '\u00a50'}
        </span>
      </div>

      <NumPad value={amount} onChange={setAmount} />

      <div className="px-4 mt-4 pb-8">
        <button onClick={handleSave} disabled={!amount || !category}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ backgroundColor: activeTab.color }}>
          入力する
        </button>
      </div>

      <CategorySheet type={type} open={showCatSheet} onClose={() => setShowCatSheet(false)} onSelect={setCategory} />
    </div>
  )
}
