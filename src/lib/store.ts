import { Category, Transaction, MonthlySummary } from './types'
import { SEED_CATEGORIES, SEED_TRANSACTIONS } from './seed'
import { generateId, getMonthDates } from './utils'

const CATEGORIES_KEY = 'kakeibo_categories'
const TRANSACTIONS_KEY = 'kakeibo_transactions'

function initIfNeeded() {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(CATEGORIES_KEY)) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(SEED_CATEGORIES))
  }
  if (!localStorage.getItem(TRANSACTIONS_KEY)) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(SEED_TRANSACTIONS))
  }
}

export function getCategories(): Category[] {
  initIfNeeded()
  if (typeof window === 'undefined') return SEED_CATEGORIES
  return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]')
}

export function getActiveCategories(type?: string): Category[] {
  const cats = getCategories().filter(c => !c.deleted)
  if (type) return cats.filter(c => c.type === type).sort((a, b) => a.sortOrder - b.sortOrder)
  return cats.sort((a, b) => a.sortOrder - b.sortOrder)
}

export function addCategory(cat: Omit<Category, 'id' | 'sortOrder' | 'deleted'>): Category {
  const cats = getCategories()
  const sameType = cats.filter(c => c.type === cat.type)
  const newCat: Category = {
    ...cat,
    id: generateId(),
    sortOrder: sameType.length + 1,
    deleted: false,
  }
  cats.push(newCat)
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats))
  return newCat
}

export function deleteCategory(id: string) {
  const cats = getCategories()
  const idx = cats.findIndex(c => c.id === id)
  if (idx !== -1) {
    cats[idx].deleted = true
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats))
  }
}

export function reorderCategories(type: string, orderedIds: string[]) {
  const cats = getCategories()
  orderedIds.forEach((id, i) => {
    const cat = cats.find(c => c.id === id)
    if (cat) cat.sortOrder = i + 1
  })
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats))
}

export function getTransactions(): Transaction[] {
  initIfNeeded()
  if (typeof window === 'undefined') return SEED_TRANSACTIONS
  return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]')
}

export function getMonthTransactions(year: number, month: number): Transaction[] {
  const { start, end } = getMonthDates(year, month)
  return getTransactions()
    .filter(t => t.date >= start && t.date <= end)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export function addTransaction(t: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const txs = getTransactions()
  const newTx: Transaction = {
    ...t,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  txs.push(newTx)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs))
  return newTx
}

export function deleteTransaction(id: string) {
  const txs = getTransactions().filter(t => t.id !== id)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs))
}

export function getMonthlySummary(year: number, month: number): MonthlySummary {
  const txs = getMonthTransactions(year, month)
  const cats = getCategories()

  let income = 0
  let personalExpense = 0
  let corporateExpense = 0
  const byCategoryMap = new Map<string, number>()

  txs.forEach(t => {
    if (t.type === 'income') {
      income += t.amount
    } else if (t.type === 'personal_expense') {
      personalExpense += t.amount
    } else {
      corporateExpense += t.amount
    }
    if (t.type !== 'income') {
      byCategoryMap.set(t.categoryId, (byCategoryMap.get(t.categoryId) || 0) + t.amount)
    }
  })

  const totalExpense = personalExpense + corporateExpense
  const balance = income - totalExpense
  const savingsRate = income > 0 ? (balance / income) * 100 : 0

  const byCategory = Array.from(byCategoryMap.entries())
    .map(([categoryId, amount]) => {
      const cat = cats.find(c => c.id === categoryId)
      return {
        categoryId,
        name: cat?.name || '不明',
        amount,
        color: cat?.color || '#999',
        icon: cat?.icon || 'Circle',
      }
    })
    .sort((a, b) => b.amount - a.amount)

  return { income, personalExpense, corporateExpense, totalExpense, balance, savingsRate, byCategory }
}
