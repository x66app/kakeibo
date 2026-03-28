"use client";
import { useState, useEffect, ReactNode } from "react";
import { Delete } from "lucide-react";

const PASSWORD_KEY = "kakeibo_password";
const AUTH_KEY = "kakeibo_authenticated";
const DEFAULT_PASSWORD = "0629";

/* ---- 外部から呼べるユーティリティ ---- */
export function initPassword() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(PASSWORD_KEY)) {
    localStorage.setItem(PASSWORD_KEY, DEFAULT_PASSWORD);
  }
}
export function changePassword(current: string, next: string): boolean {
  const saved = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  if (current !== saved) return false;
  localStorage.setItem(PASSWORD_KEY, next);
  return true;
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.reload();
}

/* ---- コンポーネント ---- */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    initPassword();
    const flag = localStorage.getItem(AUTH_KEY);
    setAuthed(flag === "true");
  }, []);

  const handleNum = (n: string) => {
    if (code.length >= 4) return;
    const next = code + n;
    setCode(next);
    if (next.length === 4) {
      const saved = localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
      if (next === saved) {
        localStorage.setItem(AUTH_KEY, "true");
        setAuthed(true);
      } else {
        setError("パスコードが違います");
        setShake(true);
        setTimeout(() => { setCode(""); setShake(false); }, 500);
      }
    }
  };

  const handleDelete = () => {
    setCode((p) => p.slice(0, -1));
    setError("");
  };

  // 初期読み込み中
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 認証済み
  if (authed) return <>{children}</>;

  // ロック画面
  const nums = ["1","2","3","4","5","6","7","8","9","","0","del"];
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f6fa] px-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">家計簿アプリ</h1>
      <p className="text-sm text-gray-500 mb-6">パスコードを入力してください</p>

      {/* ドットインジケータ */}
      <div className={`flex gap-4 mb-8 ${shake ? "animate-shake" : ""}`}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
            i < code.length
              ? error ? "bg-red-500 border-red-500" : "bg-blue-500 border-blue-500"
              : "bg-white border-gray-300"
          }`} />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* キーパッド */}
      <div className="grid grid-cols-3 gap-4 w-64">
        {nums.map((n, i) => {
          if (n === "") return <div key={i} />;
          if (n === "del") {
            return (
              <button key={i} onClick={handleDelete}
                className="h-16 rounded-2xl flex items-center justify-center text-gray-600 active:bg-gray-200 transition">
                <Delete size={24} />
              </button>
            );
          }
          return (
            <button key={i} onClick={() => handleNum(n)}
              className="h-16 rounded-2xl bg-white shadow-sm text-2xl font-semibold text-gray-800 active:bg-blue-50 transition">
              {n}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
