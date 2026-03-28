import type { Metadata, Viewport } from "next"
import "./globals.css"
import BottomNav from "@/components/BottomNav"
import { MonthProvider } from "@/contexts/MonthContext"

export const metadata: Metadata = {
  title: "家計簿アプリ",
  description: "個人・法人一体管理の家計簿",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <MonthProvider>
          <div className="max-w-lg mx-auto min-h-screen bg-[#F5F6FA] pb-20">
            {children}
          </div>
          <BottomNav />
        </MonthProvider>
      </body>
    </html>
  )
}
