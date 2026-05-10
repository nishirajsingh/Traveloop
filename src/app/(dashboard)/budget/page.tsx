"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/utils";
import { StatCardSkeleton } from "@/components/shared/Skeletons";
import type { Trip } from "@/types";

const COLORS = ["#3B82F6", "#14B8A6", "#F59E0B", "#8B5CF6"];

interface BudgetData {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categories: { category: string; amount: number; percentage: number }[];
  stops: { city: string; total: number }[];
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

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {budget && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Total Budget", value: formatCurrency(budget.totalBudget), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Total Spent", value: formatCurrency(budget.totalSpent), icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
              { label: "Remaining", value: formatCurrency(budget.remaining), icon: budget.remaining >= 0 ? TrendingDown : AlertCircle, color: budget.remaining >= 0 ? "text-teal-400" : "text-red-400", bg: budget.remaining >= 0 ? "bg-teal-500/10" : "bg-red-500/10" },
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

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
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
                    <Legend
                      formatter={(v) => <span style={{ color: "#94A3B8", fontSize: "12px" }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-[#94A3B8] text-sm">
                  No spending data yet
                </div>
              )}
            </div>

            {/* Bar Chart - City Spending */}
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
                <div className="flex items-center justify-center h-40 text-[#94A3B8] text-sm">
                  No city spending data yet
                </div>
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
                    <span className="text-sm text-white">{category}</span>
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
        <p className="text-[#94A3B8] text-sm mt-1">Track your travel spending</p>
      </div>
      <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><StatCardSkeleton key={i}/>)}</div>}>
        <BudgetContent />
      </Suspense>
    </div>
  );
}
