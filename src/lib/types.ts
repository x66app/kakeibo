export type TransactionType = 'income' | 'personal_expense' | 'corporate_expense'

export interface Category {
  id: string
  name: string
  type: TransactionType
  sortOrder: number
  deleted: boolean
  icon: string
  color: string
}

export interface Transaction {
  id: string
  date: string
  categoryId: string
  amount: number
  memo: string
  type: TransactionType
  createdAt: string
}

export interface MonthlySummary {
  income: number
  personalExpense: number
  corporateExpense: number
  totalExpense: number
  balance: number
  savingsRate: number
  byCategory: { categoryId: string; name: string; amount: number; color: string; icon: string }[]
}
