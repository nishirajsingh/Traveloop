"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Package, Check } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import type { PackingItem, Trip } from "@/types";

const CATEGORIES = ["Clothing", "Electronics", "Documents", "Essentials"];
const CATEGORY_ICONS: Record<string, string> = {
  Clothing: "👕",
  Electronics: "💻",
  Documents: "📄",
  Essentials: "🧴",
};

function PackingContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState(tripId || "");
  const [items, setItems] = useState<PackingItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [newItem, setNewItem] = useState({ name: "", category: "Essentials" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/trips").then((r) => r.json()).then((data) => {
      setTrips(data);
      if (!selectedTripId && data.length > 0) setSelectedTripId(data[0].id);
    });
  }, [selectedTripId]);

  useEffect(() => {
    if (!selectedTripId) return;
    fetch(`/api/packing?tripId=${selectedTripId}`)
      .then((r) => r.json())
      .then(setItems);
  }, [selectedTripId]);

  const addItem = async () => {
    if (!newItem.name.trim()) return toast.error("Item name required");
    setLoading(true);
    const res = await fetch("/api/packing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, tripId: selectedTripId }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setNewItem({ name: "", category: "Essentials" });
      toast.success("Item added");
    }
    setLoading(false);
  };

  const togglePacked = async (id: string, isPacked: boolean) => {
    const res = await fetch("/api/packing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPacked: !isPacked }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isPacked: !isPacked } : i)));
    }
  };

  const deleteItem = async (id: string) => {
    const res = await fetch("/api/packing", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removed");
    }
  };

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);
  const packed = items.filter((i) => i.isPacked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      {selectedTripId && (
        <>
          {/* Progress */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Packing Progress</p>
              <p className="text-sm text-[#94A3B8]">{packed} / {items.length} packed</p>
            </div>
            <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{ width: items.length > 0 ? `${(packed / items.length) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* Add Item */}
          <div className="glass rounded-xl p-5">
            <p className="text-sm font-medium text-white mb-3">Add Item</p>
            <div className="flex gap-2">
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Item name..."
                className="flex-1 px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={addItem}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === cat
                    ? "bg-blue-500 text-white"
                    : "bg-[#1E293B] text-[#94A3B8] hover:text-white"
                }`}
              >
                {cat !== "All" && CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>

          {/* Items */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8" />}
              title="No items yet"
              description="Add items to your packing list above."
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 glass rounded-xl transition-all ${
                    item.isPacked ? "opacity-60" : ""
                  }`}
                >
                  <button
                    onClick={() => togglePacked(item.id, item.isPacked)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.isPacked
                        ? "bg-teal-500 border-teal-500"
                        : "border-[#334155] hover:border-teal-500"
                    }`}
                  >
                    {item.isPacked && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.isPacked ? "line-through text-[#94A3B8]" : "text-white"}`}>
                    {item.name}
                  </span>
                  <span className="text-xs text-[#94A3B8]">
                    {CATEGORY_ICONS[item.category]} {item.category}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-[#94A3B8] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PackingPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Packing Checklist</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Never forget anything again</p>
      </div>
      <Suspense fallback={<div className="glass rounded-xl p-8 text-center text-[#94A3B8]">Loading...</div>}>
        <PackingContent />
      </Suspense>
    </div>
  );
}
