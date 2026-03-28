"use client"
import { Category } from '@/lib/types'
import { getActiveCategories } from '@/lib/store'
import { getIcon } from '@/lib/icons'
import { X } from 'lucide-react'

interface Props {
  type: string
  open: boolean
  onClose: () => void
  onSelect: (cat: Category) => void
}

export default function CategorySheet({ type, open, onClose, onSelect }: Props) {
  const cats = getActiveCategories(type)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-lg mx-auto bg-white rounded-t-2xl p-4 pb-8 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-800">カテゴリを選択</h3>
          <button onClick={onClose} className="p-1"><X size={20} color="#999" /></button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {cats.map(cat => {
            const Icon = getIcon(cat.icon)
            return (
              <button
                key={cat.id}
                onClick={() => { onSelect(cat); onClose() }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl active:bg-gray-100 transition"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '22' }}>
                  <Icon size={20} color={cat.color} />
                </div>
                <span className="text-[11px] text-gray-700 leading-tight text-center truncate w-full">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
