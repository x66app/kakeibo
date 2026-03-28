"use client"
import { MonthProvider } from "@/contexts/MonthContext"
import BottomNav from "@/components/BottomNav"
import AuthGuard from "@/components/AuthGuard"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MonthProvider>
        <div className="max-w-lg mx-auto min-h-screen bg-[#F5F6FA] pb-20">
          {children}
        </div>
        <BottomNav />
      </MonthProvider>
    </AuthGuard>
  )
}
