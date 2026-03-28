"use client";
import { useState } from "react";
import MonthSelector from "@/components/MonthSelector";
import { useMonth } from "@/contexts/MonthContext";
import { useTransactions, useCategories, updateTransaction, deleteTransaction, updateSummaryAmount } from "@/hooks/useSheets";
import { getIcon } from "@/lib/icons";
import { formatCurrency } from "@/lib/utils";
import { X, Pencil, Trash2 } from "lucide-react";

type Tab = "variable" | "fixed";

export default function TransactionsPage() {
  const { year, month } = useMonth();
  const { transactions, allTransactions, summary, loading, reload } = useTransactions(year, month);
  const { categories } = useCategories();
  const [tab, setTab] = useState<Tab>("variable");
  const [selected, setSelected] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fixedTx = allTransactions.filter(t => t.id.startsWith("summary_")).sort((a, b) => b.amount - a.amount);
  const variableTx = [...transactions].sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""));
  const displayTx = tab === "fixed" ? fixedTx : variableTx;
  const selectedTx = allTransactions.find(t => t.id === selected);

  const handleUpdate = async () => {
    if (!selectedTx) return;
    setSaving(true);
    if (selectedTx.id.startsWith("summary_")) {
      await updateSummaryAmount(year, month, selectedTx.categoryId, Number(editAmount));
    } else {
      await updateTransaction(selectedTx.id, { amount: Number(editAmount), memo: editMemo });
    }
    await reload();
    setEditMode(false);
    setSelected(null);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedTx || selectedTx.id.startsWith("summary_")) return;
    setSaving(true);
    await deleteTransaction(selectedTx.id);
    await reload();
    setShowDelete(false);
    setSelected(null);
    setSaving(false);
  };

  return (
    <div className="pb-28 px-4 pt-2 max-w-lg mx-auto">
      <MonthSelector />
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">収入</p>
          <p className="text-sm font-bold text-green-600">{formatCurrency(summary?.income || 0)}</p>
        </div>
        <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">支出</p>
          <p className="text-sm font-bold text-red-500">{formatCurrency(summary?.totalExpense || 0)}</p>
        </div>
        <div className={`flex-1 rounded-xl p-3 text-center ${(summary?.balance || 0) >= 0 ? "bg-blue-50" : "bg-red-50"}`}>
          <p className="text-xs text-gray-500">収支</p>
          <p className={`text-sm font-bold ${(summary?.balance || 0) >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {formatCurrency(summary?.balance || 0)}
          </p>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab("variable")}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "variable" ? "bg-[#2B95ED] text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
          変動費
        </button>
        <button onClick={() => setTab("fixed")}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "fixed" ? "bg-[#2B95ED] text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
          固定費
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {displayTx.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">データなし</p>}
          {displayTx.map((tx, i) => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const Icon = getIcon(cat?.icon || "Zap");
            const color = cat?.color || "#9E9E9E";
            const isIncome = tx.type === "income";
            return (
              <div key={tx.id + i}
                onClick={() => { setSelected(tx.id); setEditAmount(String(tx.amount)); setEditMemo(tx.memo || ""); setEditMode(false); }}
                className="flex items-center px-4 py-3 border-b last:border-b-0 cursor-pointer active:bg-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: color + "22" }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{tx.categoryName}</p>
                  <p className="text-xs text-gray-400">{tx.date}{tx.memo ? ` \u00b7 ${tx.memo}` : ""}</p>
                </div>
                <p className={`text-sm font-semibold ${isIncome ? "text-green-600" : "text-gray-800"}`}>
                  {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {selected && selectedTx && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">
                {selectedTx.id.startsWith("summary_") ? "固定費詳細" : "取引詳細"}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setEditMode(!editMode)} className="p-2 rounded-lg hover:bg-gray-100">
                  <Pencil size={16} className="text-gray-500" />
                </button>
                {!selectedTx.id.startsWith("summary_") && (
                  <button onClick={() => setShowDelete(true)} className="p-2 rounded-lg hover:bg-red-50">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">カテゴリ</p>
                <p className="text-sm font-medium">{selectedTx.categoryName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">種別</p>
                <p className="text-sm">{selectedTx.id.startsWith("summary_") ? "固定費（月次ベース）" : "変動費（手動入力）"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">金額</p>
                {editMode ? (
                  <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                ) : (
                  <p className="text-sm font-semibold">{formatCurrency(selectedTx.amount)}</p>
                )}
              </div>
              {!selectedTx.id.startsWith("summary_") && (
                <div>
                  <p className="text-xs text-gray-500">メモ</p>
                  {editMode ? (
                    <input type="text" value={editMemo} onChange={e => setEditMemo(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="メモ" />
                  ) : (
                    <p className="text-sm">{selectedTx.memo || "-"}</p>
                  )}
                </div>
              )}
              {selectedTx.id.startsWith("summary_") && editMode && (
                <p className="text-xs text-orange-500">※ この月の固定費金額を変更します（翌月以降には影響しません）</p>
              )}
            </div>
            {editMode && (
              <button onClick={handleUpdate} disabled={saving}
                className="w-full mt-4 py-3 rounded-xl bg-blue-500 text-white font-medium disabled:opacity-50">
                {saving ? "保存中..." : "更新する"}
              </button>
            )}
          </div>
        </div>
      )}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center px-4"
          onClick={() => setShowDelete(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <p className="text-center font-bold text-gray-800 mb-2">この取引を削除しますか？</p>
            <p className="text-center text-sm text-gray-500 mb-4">この操作は取り消せません</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-3 rounded-xl border text-gray-600">キャンセル</button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium disabled:opacity-50">
                {saving ? "削除中..." : "削除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
