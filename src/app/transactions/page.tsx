"use client"
import { useState, useEffect } from "react"
import { useMonth } from "@/contexts/MonthContext"
import { getMonthTransactions, deleteTransaction, getTransactions, getCategories, getActiveCategories } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { Transaction, Category } from "@/lib/types"
import MonthSelector from "@/components/MonthSelector"
import TransactionList from "@/components/TransactionList"
import CategorySheet from "@/components/CategorySheet"
import { X, Trash2, Pencil, Save } from "lucide-react"
import * as Icons from "lucide-react"
import { LucideProps } from "lucide-react"
import { ComponentType } from "react"

function getIcon(name: string): ComponentType<LucideProps> {
  const icon = (Icons as Record<string, ComponentType<LucideProps>>)[name]
  return icon || Icons.Circle
}

export default function TransactionsPage() {
  const { year, month } = useMonth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [editing, setEditing] = useState(false)
  const [editAmount, setEditAmount] = useState('')
  const [editMemo, setEditMemo] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [showCatSheet, setShowCatSheet] = useState(false)

  const transactions = getMonthTransactions(year, month)
  const cats = getCategories()

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type !== 'income').reduce((s, t) => s + t.amount, 0)

  const startEdit = (t: Transaction) => {
    setEditing(true)
    setEditAmount(String(t.amount))
    setEditMemo(t.memo)
    setEditDate(t.date)
    const cat = cats.find(c => c.id === t.categoryId) || null
    setEditCategory(cat)
  }

  const handleSaveEdit = () => {
    if (!selected) return
    const allTxs = getTransactions()
    const idx = allTxs.findIndex(t => t.id === selected.id)
    if (idx !== -1) {
      allTxs[idx].amount = parseFloat(editAmount) || selected.amount
      allTxs[idx].memo = editMemo
      allTxs[idx].date = editDate
      if (editCategory) {
        allTxs[idx].categoryId = editCategory.id
        allTxs[idx].type = editCategory.type
      }
      localStorage.setItem('kakeibo_transactions', JSON.stringify(allTxs))
    }
    setSelected(null)
    setEditing(false)
    setRefreshKey(k => k + 1)
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    setSelected(null)
    setEditing(false)
    setRefreshKey(k => k + 1)
  }

  const closeModal = () => {
    setSelected(null)
    setEditing(false)
  }

  const selectedCat = selected ? cats.find(c => c.id === selected.categoryId) : null
  const displayCat = editing ? editCategory : selectedCat
  const CatIcon = displayCat ? getIcon(displayCat.icon) : null

  return (
    <div key={refreshKey}>
      <MonthSelector />

      <div className="flex justify-around bg-white py-3 border-b border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400">収入</p>
          <p className="text-sm font-bold text-[#2B95ED] tabular-nums">{formatCurrency(income)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">支出</p>
          <p className="text-sm font-bold text-[#F44E5E] tabular-nums">{formatCurrency(expense)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400">収支</p>
          <p className={`text-sm font-bold tabular-nums ${income - expense >= 0 ? 'text-[#4CAF50]' : 'text-[#F44E5E]'}`}>
            {formatCurrency(income - expense)}
          </p>
        </div>
      </div>

      <div className="bg-white min-h-screen">
        <TransactionList transactions={transactions} onItemClick={t => { setSelected(t); setEditing(false) }} />
      </div>

      {/* 詳細 / 編集モーダル */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl animate-fade-in overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-base font-bold text-gray-800">
                {editing ? '明細を編集' : '明細詳細'}
              </h3>
              <div className="flex items-center gap-1">
                {!editing && (
                  <button onClick={() => startEdit(selected)} className="p-2 rounded-full active:bg-gray-100">
                    <Pencil size={16} color="#2B95ED" />
                  </button>
                )}
                <button onClick={closeModal} className="p-2 rounded-full active:bg-gray-100">
                  <X size={18} color="#999" />
                </button>
              </div>
            </div>

            <div className="px-5 pb-2">
              {/* カテゴリアイコン + 名前 */}
              {editing ? (
                <button
                  onClick={() => setShowCatSheet(true)}
                  className="w-full flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-3"
                >
                  {displayCat && CatIcon ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: displayCat.color + '22' }}>
                      <CatIcon size={16} color={displayCat.color} />
                    </div>
                  ) : (
                    <Icons.Folder size={18} color="#999" />
                  )}
                  <span className="flex-1 text-left text-sm font-medium text-gray-800">{displayCat?.name || 'カテゴリを選択'}</span>
                  <Icons.ChevronDown size={16} color="#999" />
                </button>
              ) : (
                <div className="flex items-center gap-3 mb-4">
                  {displayCat && CatIcon && (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: displayCat.color + '22' }}>
                      <CatIcon size={20} color={displayCat.color} />
                    </div>
                  )}
                  <div>
                    <p className="text-base font-bold text-gray-800">{displayCat?.name || '不明'}</p>
                    <p className="text-xs text-gray-400">{selected.type === 'income' ? '収入' : selected.type === 'personal_expense' ? '個人支出' : '法人経費'}</p>
                  </div>
                </div>
              )}

              {/* フィールド */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">日付</span>
                  {editing ? (
                    <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                      className="text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#2B95ED]/30" />
                  ) : (
                    <span className="text-sm font-medium text-gray-800">{selected.date}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">金額</span>
                  {editing ? (
                    <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                      className="text-right text-base font-bold text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5 w-36 outline-none focus:ring-2 focus:ring-[#2B95ED]/30" />
                  ) : (
                    <span className={`text-lg font-bold tabular-nums ${selected.type === 'income' ? 'text-[#2B95ED]' : 'text-gray-800'}`}>
                      {selected.type === 'income' ? '+' : '-'}{formatCurrency(selected.amount)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">メモ</span>
                  {editing ? (
                    <input type="text" value={editMemo} onChange={e => setEditMemo(e.target.value)} placeholder="メモ"
                      className="text-right text-sm font-medium text-gray-800 bg-gray-50 rounded-lg px-3 py-1.5 w-44 outline-none focus:ring-2 focus:ring-[#2B95ED]/30" />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">{selected.memo || '-'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="px-5 pt-3 pb-5 space-y-2">
              {editing ? (
                <button onClick={handleSaveEdit}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2B95ED] text-white font-bold active:scale-[0.98] transition">
                  <Save size={16} /> 保存する
                </button>
              ) : (
                <button onClick={() => handleDelete(selected.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 font-bold active:bg-red-100 transition">
                  <Trash2 size={16} /> 削除する
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* カテゴリ変更用シート */}
      {editing && selected && (
        <CategorySheet
          type={editCategory?.type || selected.type}
          open={showCatSheet}
          onClose={() => setShowCatSheet(false)}
          onSelect={cat => { setEditCategory(cat); setShowCatSheet(false) }}
        />
      )}
    </div>
  )
}
