"use client";
import { useState } from "react";
import { useMonth } from "@/contexts/MonthContext";
import { useCategories, addTransaction } from "@/hooks/useSheets";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import NumPad from "@/components/NumPad";
import { Calendar, Tag, MessageSquare, Check, ChevronDown } from "lucide-react";

type TabType = "income" | "personal_expense" | "corporate_expense";

export default function InputPage() {
  const { year, month } = useMonth();
  const { categories } = useCategories();

  const [tab, setTab] = useState<TabType>("personal_expense");
  const [amount, setAmount] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCat, setSelectedCat] = useState<{ id: string; name: string; type: string; group: string } | null>(null);
  const [memo, setMemo] = useState("");
  const [showCats, setShowCats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredCats = categories.filter(c => {
    if (tab === "income") return c.type === "income";
    if (tab === "corporate_expense") return c.group === "corporate";
    return c.type === "expense" && c.group === "personal";
  });

  const handleAmount = (v: string) => {
    
    
    setAmount(v || "0");
  };

  const handleSave = async () => {
    if (!selectedCat || amount === "0") return;
    setSaving(true);
    try {
      await addTransaction({
        date,
        categoryId: selectedCat.id,
        categoryName: selectedCat.name,
        type: selectedCat.type,
        group: selectedCat.group,
        amount: Number(amount),
        memo,
      });
      setSaved(true);
      setTimeout(() => {
        setAmount("0");
        setMemo("");
        setSaved(false);
      }, 1500);
    } catch (e) {
      alert("保存に失敗しました");
    }
    setSaving(false);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "income", label: "収入" },
    { key: "personal_expense", label: "個人支出" },
    { key: "corporate_expense", label: "法人経費" },
  ];

  return (
    <div className="pb-28 px-4 pt-4 max-w-lg mx-auto">
      {/* タブ */}
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelectedCat(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? "bg-blue-500 text-white" : "bg-white text-gray-600 border"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 日付 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <Calendar size={18} className="text-gray-400" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="flex-1 text-sm border rounded-lg px-3 py-2" />
        </div>

        {/* カテゴリ選択 */}
        <div className="flex items-center gap-3 mb-3">
          <Tag size={18} className="text-gray-400" />
          <button onClick={() => setShowCats(!showCats)}
            className="flex-1 text-left text-sm border rounded-lg px-3 py-2 flex items-center justify-between">
            {selectedCat ? (
              <span className="flex items-center gap-2">
                {(() => { const c = categories.find(c => c.id === selectedCat.id); const I = getIcon(c?.icon || "Tag"); return <I size={14} style={{ color: c?.color }} />; })()}
                {selectedCat.name}
              </span>
            ) : <span className="text-gray-400">カテゴリを選択</span>}
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>

        {/* カテゴリ一覧 */}
        {showCats && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {filteredCats.map(c => {
              const Icon = getIcon(c.icon);
              return (
                <button key={c.id}
                  onClick={() => { setSelectedCat({ id: c.id, name: c.name, type: c.type, group: c.group }); setShowCats(false); }}
                  className={`flex flex-col items-center p-2 rounded-xl text-xs transition ${selectedCat?.id === c.id ? "bg-blue-50 ring-2 ring-blue-400" : "bg-gray-50"}`}>
                  <Icon size={20} style={{ color: c.color }} />
                  <span className="mt-1 text-gray-700 truncate w-full text-center">{c.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* メモ */}
        <div className="flex items-center gap-3">
          <MessageSquare size={18} className="text-gray-400" />
          <input type="text" placeholder="メモ（任意）" value={memo}
            onChange={e => setMemo(e.target.value)}
            className="flex-1 text-sm border rounded-lg px-3 py-2" />
        </div>
      </div>

      {/* 金額表示 */}
      <div className="text-center mb-2">
        <p className="text-3xl font-bold text-gray-800 tabular-nums">¥{Number(amount).toLocaleString()}</p>
      </div>

      {/* テンキー */}
      <NumPad value={amount} onChange={v => setAmount(v || "0")} />

      {/* 保存 */}
      <button onClick={handleSave} disabled={saving || !selectedCat || amount === "0"}
        className={`w-full mt-3 py-4 rounded-2xl font-bold text-white text-base transition ${saved ? "bg-green-500" : saving ? "bg-gray-400" : "bg-blue-500 active:bg-blue-600"} disabled:opacity-50`}>
        {saved ? <span className="flex items-center justify-center gap-2"><Check size={20} /> 保存しました</span>
          : saving ? "保存中..." : "保存する"}
      </button>
    </div>
  );
}

