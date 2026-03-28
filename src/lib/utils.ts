export function formatCurrency(amount: number): string {
  return `\u00a5${amount.toLocaleString()}`
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function getYearMonth(date: string): { year: number; month: number } {
  const d = new Date(date)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export function formatDate(date: string): string {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function getMonthDates(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function typeLabel(type: string): string {
  switch (type) {
    case 'income': return '収入'
    case 'personal_expense': return '個人支出'
    case 'corporate_expense': return '法人経費'
    default: return ''
  }
}
