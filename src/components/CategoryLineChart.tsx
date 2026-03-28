"use client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getMonthlySummary } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'

interface Props {
  year: number
  categoryId: string
  color: string
  categoryName: string
}

export default function CategoryLineChart({ year, categoryId, color, categoryName }: Props) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const s = getMonthlySummary(year, m)
    const cat = s.byCategory.find(c => c.categoryId === categoryId)
    return {
      name: `${m}月`,
      amount: cat?.amount || 0,
    }
  })

  const maxVal = Math.max(...data.map(d => d.amount), 1)

  const renderTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-xs border">
          <p className="font-bold">{label}</p>
          <p style={{ color }}>{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-bold text-gray-500 mb-2 px-1">{categoryName} の月別推移</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 9 }} tickFormatter={v => v >= 10000 ? `${(v / 10000).toFixed(0)}万` : `${v}`} />
            <Tooltip content={renderTooltip} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
