"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getMonthlySummary } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

interface Props {
  year: number
}

export default function MonthlyBarChart({ year }: Props) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const s = getMonthlySummary(year, m)
    return {
      name: `${m}月`,
      収入: s.income,
      個人支出: s.personalExpense,
      法人経費: s.corporateExpense,
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => [formatCurrency(Number(value)), name]

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="収入" fill="#2B95ED" radius={[2, 2, 0, 0]} />
          <Bar dataKey="個人支出" fill="#F44E5E" radius={[2, 2, 0, 0]} />
          <Bar dataKey="法人経費" fill="#FF9800" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
