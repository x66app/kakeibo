"use client"
import { useState } from "react"
import { getActiveCategories, addCategory, deleteCategory, reorderCategories } from "@/lib/store"
import { TransactionType } from "@/lib/types"
import { CATEGORY_COLORS } from "@/lib/colors"
import { getIcon } from "@/lib/icons"
import { changePassword, getCurrentPassword, logout } from "@/components/AuthGuard"
import { Plus, Trash2, ChevronUp, ChevronDown, X, KeyRound, LogOut, Check } from "lucide-react"

const TYPE_TABS: { key: TransactionType; label: string }[] = [
  { key: 'personal_expense', label: '個人支出' },
  { key: 'corporate_expense', label: '法人経費' },
  { key: 'income', label: '収入' },
]

const ICON_OPTIONS = [
  'Home', 'Smartphone', 'Scissors', 'ShoppingCart', 'UtensilsCrossed',
  'Package', 'Coffee', 'Gamepad2', 'Users', 'BookOpen', 'Fuel',
  'Handshake', 'Heart', 'Cross', 'Train', 'MoreHorizontal', 'Building2',
  'UserCheck', 'Landmark', 'Receipt', 'Briefcase', 'Laptop', 'Coins',
  'Car', 'Wifi', 'Music', 'Camera', 'Gift', 'Zap', 'Star',
]

export default function SettingsPage() {
  const [tab, setTab] = useState<TransactionType>('personal_expense')
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('Circle')
  const [showPassChange, setShowPassChange] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState(false)

  const cats = getActiveCategories(tab)
  const refresh = () => setRefreshKey(k => k + 1)

  const handleDelete = (id: string) => {
    if (confirm('このカテゴリを削除しますか？\n（過去のデータは保持されます）')) {
      deleteCategory(id)
      refresh()
    }
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const ids = cats.map(c => c.id)
    const tmp = ids[index]; ids[index] = ids[index - 1]; ids[index - 1] = tmp
    reorderCategories(tab, ids); refresh()
  }

  const handleMoveDown = (index: number) => {
    if (index === cats.length - 1) return
    const ids = cats.map(c => c.id)
    const tmp = ids[index]; ids[index] = ids[index + 1]; ids[index + 1] = tmp
    reorderCategories(tab, ids); refresh()
  }

  const handleAdd = () => {
    if (!newName.trim()) return
    const usedColors = cats.map(c => c.color)
    const color = CATEGORY_COLORS.find(c => !usedColors.includes(c)) || CATEGORY_COLORS[0]
    addCategory({ name: newName.trim(), type: tab, icon: newIcon, color })
    setNewName(''); setNewIcon('Circle'); setShowAdd(false); refresh()
  }

  const handlePasswordChange = () => {
    setPassError('')
    if (currentPass !== getCurrentPassword()) {
      setPassError('現在のパスコードが違います')
      return
    }
    if (newPass.length < 4) {
      setPassError('4桁以上で入力してください')
      return
    }
    if (newPass !== confirmPass) {
      setPassError('新しいパスコードが一致しません')
      return
    }
    changePassword(newPass)
    setPassSuccess(true)
    setTimeout(() => {
      setShowPassChange(false)
      setPassSuccess(false)
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
    }, 1200)
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  return (
    <div key={refreshKey}>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto h-12 flex items-center justify-center">
          <span className="text-base font-bold text-gray-800">設定</span>
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="flex border-b border-gray-100 bg-white">
        {TYPE_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-bold transition-colors relative ${tab === t.key ? 'text-[#2B95ED]' : 'text-gray-400'}`}>
            {t.label}
            {tab === t.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#2B95ED] rounded-full" />}
          </button>
        ))}
      </div>

      {/* カテゴリ一覧 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-bold text-gray-500">カテゴリ管理</h3>
        </div>
        {cats.map((cat, i) => {
          const Icon = getIcon(cat.icon)
          return (
            <div key={cat.id} className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-50">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleMoveUp(i)} className="p-0.5 active:bg-gray-100 rounded" disabled={i === 0}>
                  <ChevronUp size={14} color={i === 0 ? '#ddd' : '#999'} />
                </button>
                <button onClick={() => handleMoveDown(i)} className="p-0.5 active:bg-gray-100 rounded" disabled={i === cats.length - 1}>
                  <ChevronDown size={14} color={i === cats.length - 1 ? '#ddd' : '#999'} />
                </button>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '22' }}>
                <Icon size={16} color={cat.color} />
              </div>
              <span className="flex-1 text-sm text-gray-800">{cat.name}</span>
              <button onClick={() => handleDelete(cat.id)} className="p-2 active:bg-red-50 rounded-lg">
                <Trash2 size={16} color="#F44E5E" />
              </button>
            </div>
          )
        })}
      </div>

      {/* カテゴリ追加ボタン */}
      <div className="mx-4 mt-3">
        <button onClick={() => setShowAdd(true)}
          className="w-full py-3 rounded-xl bg-white border-2 border-dashed border-gray-200 text-sm font-bold text-[#2B95ED] flex items-center justify-center gap-2 active:bg-gray-50 transition">
          <Plus size={18} /> カテゴリを追加
        </button>
      </div>

      {/* セキュリティセクション */}
      <div className="mx-4 mt-6 bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-xs font-bold text-gray-500">セキュリティ</h3>
        </div>
        <button onClick={() => setShowPassChange(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 transition text-left">
          <KeyRound size={18} color="#2B95ED" />
          <span className="flex-1 text-sm text-gray-800">パスコードを変更</span>
          <ChevronDown size={14} color="#999" className="-rotate-90" />
        </button>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition text-left">
          <LogOut size={18} color="#F44E5E" />
          <span className="flex-1 text-sm text-[#F44E5E]">ログアウト</span>
        </button>
      </div>

      <div className="h-8" />

      {/* カテゴリ追加モーダル */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-2xl p-5 pb-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">カテゴリを追加</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} color="#999" /></button>
            </div>
            <div className="mb-4">
              <label className="text-xs text-gray-500 font-bold mb-1 block">カテゴリ名</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="例: 通信費"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2B95ED]/30" autoFocus />
            </div>
            <div className="mb-5">
              <label className="text-xs text-gray-500 font-bold mb-2 block">アイコン</label>
              <div className="grid grid-cols-8 gap-2">
                {ICON_OPTIONS.map(name => {
                  const I = getIcon(name)
                  return (
                    <button key={name} onClick={() => setNewIcon(name)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${newIcon === name ? 'bg-[#2B95ED] ring-2 ring-[#2B95ED]/30' : 'bg-gray-100'}`}>
                      <I size={16} color={newIcon === name ? 'white' : '#666'} />
                    </button>
                  )
                })}
              </div>
            </div>
            <button onClick={handleAdd} disabled={!newName.trim()}
              className="w-full py-3.5 rounded-xl bg-[#2B95ED] text-white font-bold text-base active:scale-[0.98] transition disabled:opacity-40">
              追加する
            </button>
          </div>
        </div>
      )}

      {/* パスコード変更モーダル */}
      {showPassChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowPassChange(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-5 animate-fade-in" onClick={e => e.stopPropagation()}>
            {passSuccess ? (
              <div className="flex flex-col items-center py-6">
                <Check size={48} color="#4CAF50" />
                <p className="mt-3 text-base font-bold text-gray-800">変更しました</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-gray-800">パスコード変更</h3>
                  <button onClick={() => setShowPassChange(false)}><X size={18} color="#999" /></button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">現在のパスコード</label>
                    <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                      placeholder="現在のパスコード" inputMode="numeric"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2B95ED]/30 text-center tracking-[0.5em]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">新しいパスコード</label>
                    <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                      placeholder="新しいパスコード" inputMode="numeric"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2B95ED]/30 text-center tracking-[0.5em]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold mb-1 block">新しいパスコード（確認）</label>
                    <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                      placeholder="もう一度入力" inputMode="numeric"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2B95ED]/30 text-center tracking-[0.5em]" />
                  </div>
                </div>

                {passError && (
                  <p className="text-xs text-[#F44E5E] mt-3 text-center animate-fade-in">{passError}</p>
                )}

                <button onClick={handlePasswordChange}
                  className="w-full mt-5 py-3.5 rounded-xl bg-[#2B95ED] text-white font-bold text-base active:scale-[0.98] transition">
                  変更する
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
