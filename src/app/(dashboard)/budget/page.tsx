"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle,
  Plus, Trash2, Receipt, BarChart2, PieChart as PieIcon,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/utils";
import { StatCardSkeleton } from "@/components/shared/Skeletons";
import type { Trip } from "@/types";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6"];
const CATEGORIES = ["Hotel", "Transport", "Food", "Activities"] as const;
type Category = typeof CATEGORIES[number];
const CAT_ICONS: Record<Category, string> = { Hotel: "🏨", Transport: "✈️", Food: "🍽️", Activities: "🎯" };
const CAT_COLORS: Record<Category, string> = { Hotel: "text-blue-500", Transport: "text-violet-500", Food: "text-amber-500", Activities: "text-emerald-500" };
const CAT_BG: Record<Category, string> = { Hotel: "bg-blue-500/10", Transport: "bg-violet-500/10", Food: "bg-amber-500/10", Activities: "bg-emerald-500/10" };

interface BudgetEntry { id: string; title: string; amount: number; category: Category; date: string; }
interface BudgetData {
  totalBudget: number; totalSpent: number; remaining: number;
  categories: { category: string; amount: number; percentage: number }[];
  stops: { city: string; total: number }[];
  entries: BudgetEntry[];
}

function AddSpendForm({ tripId, onAdded }: { tripId: string; onAdded: (e: BudgetEntry) => void }) {
  const [form, setForm] = useState({ title: "", amount: "", category: "Activities" as Category, date: "" });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    setLoading(true);
    const res = await fetch("/api/budget/entries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount, tripId }),
    });
    if (res.ok) {
      onAdded(await res.json());
      setForm({ title: "", amount: "", category: "Activities", date: "" });
      setOpen(false);
      toast.success("Spend entry added");
    } else toast.error("Failed to add entry");
    setLoading(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="btn-primary text-xs py-2 px-3">
      <Plus className="w-3.5 h-3.5" /> Add Spend
    </button>
  );

  return (
    <div className="surface rounded-2xl p-5 border border-[var(--color-primary)]/20 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--color-text)]">New Spend Entry</p>
        <button onClick={() => setOpen(false)} className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]">Cancel</button>
      </div>

      {/* Category pills */}
      <div className="grid grid-cols-4 gap-2">
        {CATEGORIES.map((cat) => (
          <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
              form.category === cat
                ? `${CAT_BG[cat]} border-[var(--color-primary)]/30 ${CAT_COLORS[cat]}`
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}>
            <span className="text-lg">{CAT_ICONS[cat]}</span>{cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Hotel check-in" className="input-base" onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Amount (₹) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm font-semibold">₹</span>
            <input type="number" min="0" step="0.01" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="input-base pl-7" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-base pl-9" />
        </div>
      </div>

      <button onClick={submit} disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-50">
        {loading ? "Saving..." : "Save Entry"}
      </button>
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
  const [activeTab, setActiveTab] = useState<"entries" | "charts">("entries");

  useEffect(() => {
    fetch("/api/trips").then((r) => r.json()).then((data) => {
      setTrips(data);
      if (!selectedTripId && data.length > 0) setSelectedTripId(data[0].id);
    });
  }, [selectedTripId]);

  useEffect(() => {
    if (!selectedTripId) return;
    setLoading(true);
    fetch(`/api/budget/${selectedTripId}`).then((r) => r.json()).then(setBudget).finally(() => setLoading(false));
  }, [selectedTripId]);

  const handleEntryAdded = (entry: BudgetEntry) => {
    if (!budget) return;
    const newEntries = [entry, ...budget.entries];
    const breakdown: Record<string, number> = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    for (const e of newEntries) breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    for (const cat of budget.categories) {
      const actAmt = cat.amount - budget.entries.filter((e) => e.category === cat.category).reduce((s, e) => s + e.amount, 0);
      breakdown[cat.category] = (breakdown[cat.category] || 0) + Math.max(0, actAmt);
    }
    const totalSpent = Object.values(breakdown).reduce((a, b) => a + b, 0);
    setBudget({
      ...budget, entries: newEntries, totalSpent, remaining: budget.totalBudget - totalSpent,
      categories: CATEGORIES.map((category) => ({
        category, amount: breakdown[category],
        percentage: totalSpent > 0 ? Math.round((breakdown[category] / totalSpent) * 100) : 0,
      })),
    });
  };

  const deleteEntry = async (id: string) => {
    const res = await fetch("/api/budget/entries", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setBudget(await fetch(`/api/budget/${selectedTripId}`).then((r) => r.json())); toast.success("Entry deleted"); }
  };

  const tooltipStyle = { background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px", color: "var(--color-text)", fontSize: "12px" };

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>;

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
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
              }`}>
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {budget && (
        <>
          {/* Summary hero */}
          <div className="surface rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[var(--color-border)]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Budget", value: formatCurrency(budget.totalBudget), icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10", sub: "allocated" },
                  { label: "Total Spent",  value: formatCurrency(budget.totalSpent),  icon: TrendingUp,  color: "text-amber-500", bg: "bg-amber-500/10", sub: `${budget.entries.length} entries` },
                  {
                    label: "Remaining", value: formatCurrency(Math.abs(budget.remaining)),
                    icon: budget.remaining >= 0 ? TrendingDown : AlertCircle,
                    color: budget.remaining >= 0 ? "text-emerald-500" : "text-red-500",
                    bg: budget.remaining >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
                    sub: budget.remaining >= 0 ? "under budget" : "over budget",
                  },
                  {
                    label: "Usage", value: `${Math.min(Math.round((budget.totalSpent / (budget.totalBudget || 1)) * 100), 100)}%`,
                    icon: budget.totalSpent > budget.totalBudget ? ArrowUpRight : ArrowDownRight,
                    color: budget.totalSpent > budget.totalBudget ? "text-red-500" : "text-emerald-500",
                    bg: budget.totalSpent > budget.totalBudget ? "bg-red-500/10" : "bg-emerald-500/10",
                    sub: "of budget used",
                  },
                ].map(({ label, value, icon: Icon, color, bg, sub }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 ${bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                      </div>
                      <p className="section-label">{label}</p>
                    </div>
                    <p className="stat-number text-[1.5rem]">{value}</p>
                    <p className="text-xs text-[var(--color-muted)]">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            {budget.totalBudget > 0 && (
              <div className="px-5 py-4 bg-[var(--color-surface-2)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--color-text)]">Budget Usage</p>
                  <div className="flex items-center gap-1.5">
                    {budget.remaining >= 0
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      : <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    <p className={`text-xs font-bold mono ${budget.remaining >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {budget.remaining >= 0 ? `${formatCurrency(budget.remaining)} remaining` : `${formatCurrency(Math.abs(budget.remaining))} over`}
                    </p>
                  </div>
                </div>
                <div className="h-3 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${budget.totalSpent > budget.totalBudget ? "bg-red-500" : "bg-[var(--color-primary)]"}`}
                    style={{ width: `${Math.min((budget.totalSpent / budget.totalBudget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {budget.categories.map(({ category, amount, percentage }, i) => (
              <div key={category} className="surface rounded-2xl p-4 card-lift">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{CAT_ICONS[category as Category]}</span>
                  <span className="text-xs mono font-bold" style={{ color: COLORS[i] }}>{percentage}%</span>
                </div>
                <p className="text-sm font-bold text-[var(--color-text)] mono">{formatCurrency(amount)}</p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">{category}</p>
                <div className="mt-2 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { id: "entries" as const, label: "Spend Entries", icon: Receipt },
              { id: "charts"  as const, label: "Charts",        icon: BarChart2 },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  activeTab === id
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] surface"
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* Entries tab */}
          {activeTab === "entries" && (
            <div className="surface rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[var(--color-primary)]" />
                  <h3 className="font-bold text-[var(--color-text)]">Spend Entries</h3>
                  <span className="text-xs mono text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                    {budget.entries.length}
                  </span>
                </div>
                <AddSpendForm tripId={selectedTripId} onAdded={handleEntryAdded} />
              </div>

              {budget.entries.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[var(--color-text)] mb-1">No spend entries yet</p>
                  <p className="text-xs text-[var(--color-muted)]">Add your first expense to start tracking.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {budget.entries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3.5 surface-2 rounded-xl group card-lift">
                      <div className={`w-9 h-9 ${CAT_BG[entry.category]} rounded-xl flex items-center justify-center flex-shrink-0 text-lg`}>
                        {CAT_ICONS[entry.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{entry.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-semibold ${CAT_COLORS[entry.category]}`}>{entry.category}</span>
                          <span className="text-[var(--color-border-strong)]">·</span>
                          <span className="text-xs mono text-[var(--color-muted)]">{formatDate(entry.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-black mono text-[var(--color-text)]">{formatCurrency(entry.amount)}</span>
                        <button onClick={() => deleteEntry(entry.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Charts tab */}
          {activeTab === "charts" && (
            <div className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="surface rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <PieIcon className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="font-bold text-[var(--color-text)]">By Category</h3>
                  </div>
                  {budget.totalSpent > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={budget.categories.filter((c) => c.amount > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="amount" nameKey="category" paddingAngle={3}>
                          {budget.categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                        <Legend formatter={(v) => <span style={{ color: "var(--color-muted)", fontSize: "11px" }}>{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-40 text-[var(--color-muted)] text-sm">No data yet</div>}
                </div>

                <div className="surface rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-4 h-4 text-[var(--color-primary)]" />
                    <h3 className="font-bold text-[var(--color-text)]">By City</h3>
                  </div>
                  {budget.stops.some((s) => s.total > 0) ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={budget.stops} barSize={28}>
                        <XAxis dataKey="city" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} tickFormatter={(v) => `₹${v}`} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} cursor={{ fill: "var(--color-surface-2)" }} />
                        <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-40 text-[var(--color-muted)] text-sm">No data yet</div>}
                </div>
              </div>

              {/* Category breakdown bars */}
              <div className="surface rounded-2xl p-5">
                <h3 className="font-bold text-[var(--color-text)] mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {budget.categories.map(({ category, amount, percentage }, i) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{CAT_ICONS[category as Category]}</span>
                          <span className="text-sm font-semibold text-[var(--color-text)]">{category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold mono text-[var(--color-text)]">{formatCurrency(amount)}</span>
                          <span className="text-xs mono text-[var(--color-muted)] w-8 text-right">{percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: COLORS[i] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!budget && !loading && (
        <div className="surface rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-[var(--color-surface-2)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-7 h-7 text-[var(--color-muted)]" />
          </div>
          <p className="font-bold text-[var(--color-text)] mb-1">No trip selected</p>
          <p className="text-sm text-[var(--color-muted)]">Select a trip above to view budget analytics.</p>
        </div>
      )}
    </div>
  );
}

export default function BudgetPage() {
  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">Budget Analytics</h1>
          <p className="text-[var(--color-muted)] text-sm mt-0.5">Track and manage your travel spending</p>
        </div>
      </div>
      <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>}>
        <BudgetContent />
      </Suspense>
    </div>
  );
}
