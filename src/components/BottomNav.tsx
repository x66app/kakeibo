"use client"
import { usePathname, useRouter } from 'next/navigation'
import { Home, FileText, Plus, PieChart, Settings } from 'lucide-react'

const tabs = [
  { key: '/', icon: Home, label: 'ホーム' },
  { key: '/transactions', icon: FileText, label: '入出金' },
  { key: '/input', icon: Plus, label: '入力', isCenter: true },
  { key: '/budget', icon: PieChart, label: '家計簿' },
  { key: '/settings', icon: Settings, label: '設定' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex items-end justify-around h-16 px-1">
        {tabs.map(tab => {
          const active = pathname === tab.key
          if (tab.isCenter) {
            return (
              <button
                key={tab.key}
                onClick={() => router.push(tab.key)}
                className="flex flex-col items-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-[#2B95ED] flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <tab.icon size={28} color="white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] mt-0.5 text-[#2B95ED] font-bold">{tab.label}</span>
              </button>
            )
          }
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.key)}
              className="flex flex-col items-center justify-center pt-2 pb-1 flex-1"
            >
              <tab.icon size={22} color={active ? '#2B95ED' : '#999'} strokeWidth={active ? 2.5 : 1.5} />
              <span className={`text-[10px] mt-0.5 ${active ? 'text-[#2B95ED] font-bold' : 'text-[#999]'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
