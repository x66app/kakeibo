"use client"
import { createContext, useContext, useState, ReactNode } from 'react'

interface MonthContextType {
  year: number
  month: number
  prev: () => void
  next: () => void
  set: (y: number, m: number) => void
}

const MonthContext = createContext<MonthContextType | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const prev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const next = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const set = (y: number, m: number) => { setYear(y); setMonth(m) }

  return (
    <MonthContext.Provider value={{ year, month, prev, next, set }}>
      {children}
    </MonthContext.Provider>
  )
}

export function useMonth() {
  const ctx = useContext(MonthContext)
  if (!ctx) throw new Error('useMonth must be inside MonthProvider')
  return ctx
}
