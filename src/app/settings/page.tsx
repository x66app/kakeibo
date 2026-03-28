"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, LogOut, Lock, Tag } from "lucide-react";
import { getActiveCategories, addCategory, deleteCategory, reorderCategories } from "@/lib/store";
import { changePassword, logout } from "@/components/AuthGuard";
import { getIcon } from "@/lib/icons";
import { Category, TransactionType } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/colors";

const ICONS = ["Home","Utensils","Car","Smartphone","ShoppingBag","Heart","Briefcase","GraduationCap",
  "Plane","Gift","Music","Coffee","Dumbbell","Wifi","Droplets","Zap","Flame","PiggyBank",
  "CreditCard","Building","Monitor","Printer","Users","TrendingUp","Banknote","Wallet"];

export default function SettingsPage() {
  const [tab, setTab] = useState<TransactionType>("personal_expense");
  const [cats, setCats] = useState<Category[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("Tag");
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);

  /* パスワード変更 */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  const load = () => setCats(getActiveCategories().filter(c => c.type === tab));
  useEffect(() => { load(); }, [tab]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), type: tab, icon: newIcon, color: newColor });
    setNewName(""); setShowAdd(false); load();
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = cats.findIndex(c => c.id === id);
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === cats.length - 1)) return;
    const arr = [...cats];
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    reorderCategories(tab, arr.map(c => c.id));
    load();
  };

  const handleChangePw = () => {
    setPwMsg(""); setPwError("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("すべて入力してください"); return; }
    if (newPw.length < 4) { setPwError("4桁以上で入力してください"); return; }
    if (newPw !== confirmPw) { setPwError("新しいパスコードが一致しません"); return; }
    const ok = changePassword(currentPw, newPw);
    if (!ok) { setPwError("現在のパスコードが間違っています"); return; }
    setPwMsg("パスコードを変更しました");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  const tabs: { key: TransactionType; label: string }[] = [
    { key: "personal_expense", label: "個人支出" },
    { key: "corporate_expense", label: "法人経費" },
    { key: "income", label: "収入" },
  ];

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-gray-800 mb-4">設定</h1>

      {/* ===== カテゴリ管理 ===== */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={18} className="text-gray-600" />
          <h2 className="font-semibold text-gray-700">カテゴリ管理</h2>
        </div>

        <div className="flex gap-2 mb-3">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.key ? "bg-blue-500 text-white" : "bg-white text-gray-600 border"
              }`}>{t.label}</button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {cats.map((c) => {
            const Icon = getIcon(c.icon);
            return (
              <div key={c.id} className="flex items-center px-4 py-3 border-b last:border-b-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: c.color + "22" }}>
                  <Icon size={16} style={{ color: c.color }} />
                </div>
                <span className="flex-1 text-sm text-gray-800">{c.name}</span>
                <button onClick={() => move(c.id, -1)} className="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => move(c.id, 1)} className="p-1 text-gray-400 hover:text-gray-600">
                  <ChevronDown size={16} />
                </button>
                <button onClick={() => { deleteCategory(c.id); load(); }}
                  className="p-1 text-gray-400 hover:text-red-500 ml-1">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <button onClick={() => setShowAdd(true)}
          className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm flex items-center justify-center gap-1 hover:border-blue-400 hover:text-blue-500 transition">
          <Plus size={16} /> カテゴリを追加
        </button>
      </section>

      {/* ===== パスコード変更 ===== */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={18} className="text-gray-600" />
          <h2 className="font-semibold text-gray-700">パスコード変更</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <input type="password" placeholder="現在のパスコード" value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="新しいパスコード（4桁以上）" value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="新しいパスコード（確認）" value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
          {pwMsg && <p className="text-green-600 text-xs">{pwMsg}</p>}
          <button onClick={handleChangePw}
            className="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-medium">変更する</button>
        </div>
      </section>

      {/* ===== ログアウト ===== */}
      <button onClick={logout}
        className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-medium text-sm flex items-center justify-center gap-2">
        <LogOut size={16} /> ログアウト
      </button>

      {/* ===== カテゴリ追加モーダル ===== */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={() => setShowAdd(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 animate-slideUp"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4">カテゴリ追加</h3>
            <input placeholder="カテゴリ名" value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3" />

            <p className="text-xs text-gray-500 mb-2">アイコン</p>
            <div className="grid grid-cols-8 gap-2 mb-3">
              {ICONS.map(ic => {
                const Ic = getIcon(ic);
                return (
                  <button key={ic} onClick={() => setNewIcon(ic)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      newIcon === ic ? "ring-2 ring-blue-500 bg-blue-50" : "bg-gray-100"
                    }`}><Ic size={16} /></button>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 mb-2">カラー</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORY_COLORS.map(cl => (
                <button key={cl} onClick={() => setNewColor(cl)}
                  className={`w-7 h-7 rounded-full ${newColor === cl ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                  style={{ backgroundColor: cl }} />
              ))}
            </div>

            <button onClick={handleAdd}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-medium">追加する</button>
          </div>
        </div>
      )}
    </div>
  );
}
