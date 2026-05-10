"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus, Trash2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/utils";
import { StatCardSkeleton } from "@/components/shared/Skeletons";
import type { Trip } from "@/types";

const COLORS = ["#3B82F6", "#14B8A6", "#F59E0B", "#8B5CF6"];
const CATEGORIES = ["Hotel", "Transport", "Food", "Activities"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_ICONS: Record<Category, string> = {
  Hotel: "🏨",
  Transport: "✈️",
  Food: "🍽️",
  Activities: "🎯",
};

interface BudgetEntry {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
}

interface BudgetData {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categories: { category: string; amount: number; percentage: number }[];
  stops: { city: string; total: number }[];
  entries: BudgetEntry[];
}

function AddSpendForm({
  tripId,
  onAdded,
}: {
  tripId: string;
  onAdded: (entry: BudgetEntry) => void;
}) {
  const [form, setForm] = useState({ title: "", amount: "", category: "Activities" as Category, date: "" });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");

    setLoading(true);
    const res = await fetch("/api/budget/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount, tripId }),
    });
    if (res.ok) {
      const entry = await res.json();
      onAdded(entry);
      setForm({ title: "", amount: "", category: "Activities", date: "" });
      setOpen(false);
      toast.success("Spend entry added");
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || "Failed to add entry");
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Spend
      </button>
    );
  }

  return (
    <div className="glass rounded-xl p-5 border border-blue-500/30 space-y-4">
      <p className="text-sm font-semibold text-white">Add Spend Entry</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8]">Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Hotel check-in"
            className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8]">Amount (USD) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8]">Category *</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  form.category === cat
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                    : "bg-[#0F172A]/40 border-[#334155] text-[#94A3B8] hover:text-white"
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8]">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function BudgetContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState(tripId || "");
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/trips").then((r) => r.json()).then((data) => {
      setTrips(data);
      if (!selectedTripId && data.length > 0) setSelectedTripId(data[0].id);
    });
  }, [selectedTripId]);

  useEffect(() => {
    if (!selectedTripId) return;
    setLoading(true);
    fetch(`/api/budget/${selectedTripId}`)
      .then((r) => r.json())
      .then(setBudget)
      .finally(() => setLoading(false));
  }, [selectedTripId]);

  const handleEntryAdded = (entry: BudgetEntry) => {
    if (!budget) return;
    const newEntries = [entry, ...budget.entries];
    // Recalculate breakdown locally
    const breakdown: Record<string, number> = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    for (const e of newEntries) {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    }
    // Add activity costs back
    for (const cat of budget.categories) {
      const activityAmount = cat.amount - (budget.entries.filter((e) => e.category === cat.category).reduce((s, e) => s + e.amount, 0));
      breakdown[cat.category] = (breakdown[cat.category] || 0) + Math.max(0, activityAmount);
    }
    const totalSpent = Object.values(breakdown).reduce((a, b) => a + b, 0);
    setBudget({
      ...budget,
      entries: newEntries,
      totalSpent,
      remaining: budget.totalBudget - totalSpent,
      categories: CATEGORIES.map((category) => ({
        category,
        amount: breakdown[category],
        percentage: totalSpent > 0 ? Math.round((breakdown[category] / totalSpent) * 100) : 0,
      })),
    });
  };

  const deleteEntry = async (id: string) => {
    const res = await fetch("/api/budget/entries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      // Refetch to get accurate totals
      const data = await fetch(`/api/budget/${selectedTripId}`).then((r) => r.json());
      setBudget(data);
      toast.success("Entry deleted");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trip selector */}
      <div className="flex items-center gap-3">
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      {budget && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Total Budget", value: formatCurrency(budget.totalBudget), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Total Spent", value: formatCurrency(budget.totalSpent), icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
              {
                label: "Remaining",
                value: formatCurrency(budget.remaining),
                icon: budget.remaining >= 0 ? TrendingDown : AlertCircle,
                color: budget.remaining >= 0 ? "text-teal-400" : "text-red-400",
                bg: budget.remaining >= 0 ? "bg-teal-500/10" : "bg-red-500/10",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wide">{label}</p>
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Budget progress bar */}
          {budget.totalBudget > 0 && (
            <div className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Budget Usage</p>
                <p className="text-sm text-[#94A3B8]">
                  {Math.min(Math.round((budget.totalSpent / budget.totalBudget) * 100), 100)}%
                </p>
              </div>
              <div className="h-3 bg-[#334155] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budget.totalSpent > budget.totalBudget ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-teal-500"
                  }`}
                  style={{ width: `${Math.min((budget.totalSpent / budget.totalBudget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#94A3B8]">
                <span>Spent: {formatCurrency(budget.totalSpent)}</span>
                <span>Budget: {formatCurrency(budget.totalBudget)}</span>
              </div>
            </div>
          )}

          {/* Add Spend + Entries */}
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#94A3B8]" />
                <h3 className="font-semibold text-white">Spend Entries</h3>
                <span className="text-xs text-[#94A3B8] bg-[#334155] px-2 py-0.5 rounded-full">
                  {budget.entries.length}
                </span>
              </div>
              <AddSpendForm tripId={selectedTripId} onAdded={handleEntryAdded} />
            </div>

            {budget.entries.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm text-[#94A3B8]">No spend entries yet. Add your first expense above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {budget.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-[#0F172A]/40 rounded-xl group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[entry.category]}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{entry.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                            {entry.category}
                          </span>
                          <span className="text-xs text-[#94A3B8]">{formatDate(entry.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-teal-400">{formatCurrency(entry.amount)}</span>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-[#94A3B8] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Spending by Category</h3>
              {budget.totalSpent > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={budget.categories.filter((c) => c.amount > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {budget.categories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(Number(v))}
                      contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                      labelStyle={{ color: "#F8FAFC" }}
                    />
                    <Legend formatter={(v) => <span style={{ color: "#94A3B8", fontSize: "12px" }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-[#94A3B8] text-sm">No spending data yet</div>
              )}
            </div>

            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Spending by City</h3>
              {budget.stops.some((s) => s.total > 0) ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={budget.stops}>
                    <XAxis dataKey="city" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(v) => formatCurrency(Number(v))}
                      contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px" }}
                      labelStyle={{ color: "#F8FAFC" }}
                    />
                    <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-[#94A3B8] text-sm">No city spending data yet</div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {budget.categories.map(({ category, amount, percentage }, i) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[category as Category]}</span>
                      <span className="text-sm text-white">{category}</span>
                    </div>
                    <span className="text-sm text-[#94A3B8]">{formatCurrency(amount)} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!budget && !loading && (
        <div className="glass rounded-xl p-12 text-center">
          <DollarSign className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-[#94A3B8]">Select a trip to view budget analytics</p>
        </div>
      )}
    </div>
  );
}

export default function BudgetPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Budget Analytics</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Track and manage your travel spending</p>
      </div>
      <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>}>
        <BudgetContent />
      </Suspense>
    </div>
  );
}
