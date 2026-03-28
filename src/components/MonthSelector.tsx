"use client"
import { useMonth } from '@/contexts/MonthContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function MonthSelector() {
  const { year, month, prev, next } = useMonth()

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-lg mx-auto flex items-center justify-between h-12 px-4">
        <button onClick={prev} className="p-2 active:bg-gray-100 rounded-full">
          <ChevronLeft size={20} color="#2B95ED" />
        </button>
        <span className="text-base font-bold text-gray-800">
          {year}年{month}月
        </span>
        <button onClick={next} className="p-2 active:bg-gray-100 rounded-full">
          <ChevronRight size={20} color="#2B95ED" />
        </button>
      </div>
    </div>
  )
}
