"use client"
import { useState, useEffect, ReactNode } from 'react'
import { Lock } from 'lucide-react'

const AUTH_KEY = 'kakeibo_authenticated'
const PASS_KEY = 'kakeibo_password'
const DEFAULT_PASS = '0629'

function getPassword(): string {
  if (typeof window === 'undefined') return DEFAULT_PASS
  return localStorage.getItem(PASS_KEY) || DEFAULT_PASS
}

export function initPassword() {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(PASS_KEY)) {
    localStorage.setItem(PASS_KEY, DEFAULT_PASS)
  }
}

export function changePassword(newPass: string) {
  localStorage.setItem(PASS_KEY, newPass)
}

export function getCurrentPassword(): string {
  return getPassword()
}

export function logout() {
  sessionStorage.removeItem(AUTH_KEY)
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    initPassword()
    const session = sessionStorage.getItem(AUTH_KEY)
    if (session === 'true') {
      setAuthed(true)
    }
    setChecking(false)
  }, [])

  const handleSubmit = () => {
    if (input === getPassword()) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthed(true)
      setError(false)
    } else {
      setError(true)
      setInput('')
    }
  }

  const handleKeyPress = (key: string) => {
    if (key === 'del') {
      setInput(prev => prev.slice(0, -1))
      setError(false)
    } else {
      const next = input + key
      setInput(next)
      setError(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2B95ED] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-xs animate-fade-in">
        {/* アイコン */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-[#E8F4FD] flex items-center justify-center">
            <Lock size={28} color="#2B95ED" />
          </div>
        </div>

        <h1 className="text-lg font-bold text-gray-800 text-center mb-1">家計簿アプリ</h1>
        <p className="text-xs text-gray-400 text-center mb-6">パスコードを入力してください</p>

        {/* ドット表示 */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                i < input.length
                  ? error ? 'bg-[#F44E5E] scale-110' : 'bg-[#2B95ED] scale-110'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <p className="text-xs text-[#F44E5E] text-center mb-4 animate-fade-in">
            パスコードが違います
          </p>
        )}

        {/* テンキー */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1','2','3','4','5','6','7','8','9','','0','del'].map(key => {
            if (key === '') return <div key="empty" />
            return (
              <button
                key={key}
                onClick={() => {
                  if (key === 'del') {
                    handleKeyPress('del')
                  } else {
                    const next = input + key
                    if (next.length <= 4) {
                      handleKeyPress(key)
                      if (next.length === 4) {
                        setTimeout(() => {
                          if (next === getPassword()) {
                            sessionStorage.setItem(AUTH_KEY, 'true')
                            setAuthed(true)
                            setError(false)
                          } else {
                            setError(true)
                            setInput('')
                          }
                        }, 200)
                      }
                    }
                  }
                }}
                className={`h-14 rounded-xl text-lg font-semibold transition-all active:scale-95
                  ${key === 'del' ? 'bg-gray-100 text-gray-500 text-base' : 'bg-gray-50 text-gray-800 active:bg-gray-200'}
                `}
              >
                {key === 'del' ? '⌫' : key}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
