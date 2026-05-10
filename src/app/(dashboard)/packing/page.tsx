"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Package, Check, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import type { PackingItem, Trip } from "@/types";

const CATEGORIES = ["Clothing", "Electronics", "Documents", "Essentials"] as const;
type Category = typeof CATEGORIES[number];
const CAT_ICONS: Record<Category, string> = { Clothing: "👕", Electronics: "💻", Documents: "📄", Essentials: "🧴" };
const CAT_COLORS: Record<Category, { text: string; bg: string; border: string }> = {
  Clothing:    { text: "text-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  Electronics: { text: "text-violet-500",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  Documents:   { text: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  Essentials:  { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

function PackingContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState(tripId || "");
  const [items, setItems] = useState<PackingItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", category: "Essentials" as Category });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {
    fetch("/api/trips").then((r) => r.json()).then((data) => {
      setTrips(data);
      if (!selectedTripId && data.length > 0) setSelectedTripId(data[0].id);
    });
  }, [selectedTripId]);

  useEffect(() => {
    if (!selectedTripId) return;
    fetch(`/api/packing?tripId=${selectedTripId}`).then((r) => r.json()).then(setItems);
  }, [selectedTripId]);

  const addItem = async () => {
    if (!newItem.name.trim()) return toast.error("Item name required");
    setLoading(true);
    const res = await fetch("/api/packing", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, tripId: selectedTripId }),
    });
    if (res.ok) { const item = await res.json(); setItems((p) => [...p, item]); setNewItem({ name: "", category: newItem.category }); toast.success("Item added"); }
    setLoading(false);
  };

  const togglePacked = async (id: string, isPacked: boolean) => {
    const res = await fetch("/api/packing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isPacked: !isPacked }) });
    if (res.ok) setItems((p) => p.map((i) => i.id === id ? { ...i, isPacked: !isPacked } : i));
  };

  const deleteItem = async (id: string) => {
    const res = await fetch("/api/packing", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setItems((p) => p.filter((i) => i.id !== id)); toast.success("Item removed"); }
  };

  const markAllPacked = async () => {
    const unpacked = items.filter((i) => !i.isPacked);
    await Promise.all(unpacked.map((i) =>
      fetch("/api/packing", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: i.id, isPacked: true }) })
    ));
    setItems((p) => p.map((i) => ({ ...i, isPacked: true })));
    toast.success("All items marked as packed!");
  };

  const packed = items.filter((i) => i.isPacked).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Trip selector */}
      <div className="surface rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Trip</p>
        <div className="flex gap-2 flex-wrap flex-1">
          {trips.map((t) => (
            <button key={t.id} onClick={() => setSelectedTripId(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedTripId === t.id
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}>
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {selectedTripId && (
        <>
          {/* Progress hero */}
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-[var(--color-text)]">Packing Progress</h2>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {packed} of {total} items packed
                </p>
              </div>
              <div className="flex items-center gap-2">
                {packed < total && total > 0 && (
                  <button onClick={markAllPacked} className="btn-ghost text-xs py-1.5 px-3">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark all packed
                  </button>
                )}
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="var(--color-border)" strokeWidth="4" />
                    <circle cx="28" cy="28" r="22" fill="none"
                      stroke={pct === 100 ? "#10B981" : "var(--color-primary)"}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-black mono text-[var(--color-text)]">
                    {pct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Category progress bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const catItems = items.filter((i) => i.category === cat);
                const catPacked = catItems.filter((i) => i.isPacked).length;
                const c = CAT_COLORS[cat];
                return (
                  <div key={cat} className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-base">{CAT_ICONS[cat]}</span>
                      <span className={`text-xs font-bold mono ${c.text}`}>{catItems.length}</span>
                    </div>
                    <p className={`text-xs font-semibold ${c.text}`}>{cat}</p>
                    <p className="text-xs text-[var(--color-muted)]">{catPacked}/{catItems.length} packed</p>
                  </div>
                );
              })}
            </div>

            {pct === 100 && total > 0 && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-500">All packed! You&apos;re ready to go. ✈️</p>
              </div>
            )}
          </div>

          {/* Add item + view toggle */}
          <div className="surface rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[var(--color-text)]">Add Item</h3>
              <div className="flex gap-1">
                {(["list", "grid"] as const).map((v) => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"}`}>
                    {v === "list" ? "☰ List" : "⊞ Grid"}
                  </button>
                ))}
              </div>
            </div>

            {/* Category selector */}
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const c = CAT_COLORS[cat];
                return (
                  <button key={cat} type="button" onClick={() => setNewItem({ ...newItem, category: cat })}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      newItem.category === cat ? `${c.bg} ${c.border} ${c.text}` : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    }`}>
                    <span className="text-lg">{CAT_ICONS[cat]}</span>{cat}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder={`Add ${newItem.category.toLowerCase()} item...`}
                className="input-base flex-1"
              />
              <button onClick={addItem} disabled={loading} className="btn-primary px-4 flex-shrink-0 disabled:opacity-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="surface rounded-2xl p-12 text-center">
              <div className="w-14 h-14 bg-[var(--color-surface-2)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-[var(--color-muted)]" />
              </div>
              <p className="font-bold text-[var(--color-text)] mb-1">Nothing to pack yet</p>
              <p className="text-sm text-[var(--color-muted)]">Add items above to start your packing list.</p>
            </div>
          ) : view === "list" ? (
            /* List view — grouped by category */
            <div className="space-y-4">
              {CATEGORIES.map((cat) => {
                const catItems = items.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;
                const c = CAT_COLORS[cat];
                return (
                  <div key={cat} className="surface rounded-2xl overflow-hidden">
                    <div className={`flex items-center gap-2 px-4 py-3 ${c.bg} border-b ${c.border}`}>
                      <span className="text-base">{CAT_ICONS[cat]}</span>
                      <p className={`text-sm font-bold ${c.text}`}>{cat}</p>
                      <span className={`text-xs mono ml-auto ${c.text}`}>
                        {catItems.filter((i) => i.isPacked).length}/{catItems.length}
                      </span>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {catItems.map((item) => (
                        <div key={item.id} className={`flex items-center gap-3 px-4 py-3 group transition-colors hover:bg-[var(--color-surface-2)] ${item.isPacked ? "opacity-60" : ""}`}>
                          <button onClick={() => togglePacked(item.id, item.isPacked)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              item.isPacked ? "bg-emerald-500 border-emerald-500" : `border-[var(--color-border-strong)] hover:${c.border}`
                            }`}>
                            {item.isPacked && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`flex-1 text-sm font-medium ${item.isPacked ? "line-through text-[var(--color-muted)]" : "text-[var(--color-text)]"}`}>
                            {item.name}
                          </span>
                          <button onClick={() => deleteItem(item.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Grid view */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => {
                const c = CAT_COLORS[item.category as Category];
                return (
                  <div key={item.id}
                    className={`surface rounded-xl p-3.5 flex items-center gap-3 card-lift group cursor-pointer ${item.isPacked ? "opacity-60" : ""}`}
                    onClick={() => togglePacked(item.id, item.isPacked)}>
                    <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {item.isPacked
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <Circle className={`w-4 h-4 ${c.text}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${item.isPacked ? "line-through text-[var(--color-muted)]" : "text-[var(--color-text)]"}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs ${c.text}`}>{item.category}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PackingPage() {
  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">Packing Checklist</h1>
        <p className="text-[var(--color-muted)] text-sm mt-0.5">Never forget anything again</p>
      </div>
      <Suspense fallback={<div className="surface rounded-2xl p-8 text-center text-[var(--color-muted)]">Loading...</div>}>
        <PackingContent />
      </Suspense>
    </div>
  );
}
