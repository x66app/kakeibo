"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { MonthlySummary } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  summary: MonthlySummary
}

export default function DonutChart({ summary }: Props) {
  const outerData = summary.byCategory.map(c => ({
    name: c.name,
    value: c.amount,
    color: c.color,
  }))

  const innerData = [
    { name: '個人支出', value: summary.personalExpense, color: '#F44E5E' },
    { name: '法人経費', value: summary.corporateExpense, color: '#FF9800' },
  ].filter(d => d.value > 0)

  if (outerData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">データなし</div>
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: any) => {
    const v = Number(value)
    const pct = summary.totalExpense > 0 ? ((v / summary.totalExpense) * 100).toFixed(1) : '0'
    return [`${formatCurrency(v)} (${pct}%)`, name]
  }

  return (
    <div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={innerData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={2}>
              {innerData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Pie data={outerData} dataKey="value" cx="50%" cy="50%" innerRadius={66} outerRadius={85} paddingAngle={1}>
              {outerData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip
              formatter={tooltipFormatter}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 px-1">
        {outerData.map((d, i) => {
          const pct = summary.totalExpense > 0 ? ((d.value / summary.totalExpense) * 100) : 0
          return (
            <div key={d.name + i} className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] text-gray-600 truncate">{d.name}</span>
              <span className="text-[10px] font-bold text-gray-700 tabular-nums ml-auto shrink-0">{pct.toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

