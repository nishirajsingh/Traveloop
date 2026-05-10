import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Plus, Map, DollarSign, Calendar, TrendingUp, ArrowRight,
  Globe, Package, BookOpen, Clock, CheckCircle2, AlertCircle,
  Plane, BarChart2, Zap, MapPin, Receipt, Sparkles,
} from "lucide-react";
import { formatCurrency, formatDate, getDaysBetween, getTripStatus } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";
import { TripCountdown } from "@/components/shared/TripCountdown";
import { HeroMessage } from "@/components/shared/HeroMessage";

const TRENDING = [
  { city: "Tokyo",    country: "Japan",     state: "Kantō",       img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=70", trend: "+24%", tag: "🔥 Hot" },
  { city: "Paris",    country: "France",    state: "Île-de-France",img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=70", trend: "+18%", tag: "🌸 Spring" },
  { city: "Bali",     country: "Indonesia", state: "Bali",         img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=70", trend: "+31%", tag: "🏄 Beach" },
  { city: "New York", country: "USA",       state: "New York",     img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=70", trend: "+12%", tag: "🗽 City" },
  { city: "Goa",      country: "India",     state: "Goa",          img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=70", trend: "+19%", tag: "🌊 Beach" },
  { city: "Manali",   country: "India",     state: "Himachal Pradesh", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=70", trend: "+27%", tag: "🏔 Hills" },
];

const QUICK_ACTIONS = [
  { href: "/trips/create", label: "Plan a Trip",    desc: "New itinerary",    icon: Plane,     color: "text-blue-500",    bg: "bg-blue-500/10" },
  { href: "/recommendations", label: "AI Suggestions", desc: "Get recommendations", icon: Sparkles, color: "text-purple-500",  bg: "bg-purple-500/10" },
  { href: "/budget",       label: "Track Budget",   desc: "View analytics",   icon: BarChart2, color: "text-amber-500",   bg: "bg-amber-500/10" },
  { href: "/packing",      label: "Packing List",   desc: "Manage items",     icon: Package,   color: "text-violet-500",  bg: "bg-violet-500/10" },
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [trips, totalTrips, packingItems, notes, budgetEntries] = await Promise.all([
    prisma.trip.findMany({
      where: { userId },
      include: {
        _count: { select: { stops: true } },
        stops: { include: { activities: true } },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.trip.count({ where: { userId } }),
    prisma.packingItem.findMany({
      where: { trip: { userId } },
      select: { isPacked: true },
    }),
    prisma.note.count({ where: { trip: { userId } } }),
    prisma.budgetEntry.findMany({
      where: { trip: { userId } },
      select: { amount: true, category: true, title: true, date: true, tripId: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  const upcomingTrips  = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === "upcoming");
  const ongoingTrips   = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === "ongoing");
  const completedTrips = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === "completed");

  const totalBudget = trips.reduce((s, t) => s + t.totalBudget, 0);

  // Activity costs from stops
  const activitySpend = trips.reduce(
    (s, t) => s + t.stops.reduce((ss, stop) => ss + stop.activities.reduce((a, act) => a + act.cost, 0), 0), 0
  );
  // Manual budget entries
  const entrySpend = budgetEntries.reduce((s, e) => s + e.amount, 0);
  const totalSpent = activitySpend + entrySpend;
  const budgetLeft = totalBudget - totalSpent;

  // Per-category spend breakdown (activities + entries)
  const CATS = ["Hotel", "Transport", "Food", "Activities"] as const;
  type Cat = typeof CATS[number];
  const catSpend: Record<Cat, number> = { Hotel: 0, Transport: 0, Food: 0, Activities: 0 };
  for (const t of trips)
    for (const stop of t.stops)
      for (const act of stop.activities)
        if (act.category in catSpend) catSpend[act.category as Cat] += act.cost;
  for (const e of budgetEntries)
    if (e.category in catSpend) catSpend[e.category as Cat] += e.amount;

  // Recent spend entries (last 5)
  const recentEntries = budgetEntries.slice(0, 5).map((e) => ({
    ...e,
    tripTitle: trips.find((t) => t.id === e.tripId)?.title ?? "Unknown",
  }));

  const packedCount   = packingItems.filter((i) => i.isPacked).length;
  const totalPacking  = packingItems.length;

  // Next upcoming trip
  const nextTrip = upcomingTrips.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )[0];

  // Total activities count
  const totalActivities = trips.reduce(
    (s, t) => s + t.stops.reduce((ss, stop) => ss + stop.activities.length, 0), 0
  );

  const firstName = session?.user?.name?.split(" ")[0] ?? "Traveller";

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6">

      {/* ── Greeting Hero ── */}
      <div className="relative surface rounded-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=60"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 flex items-center justify-between p-6 gap-4">
          <div>
            <p className="section-label mb-1">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text)]">
              {firstName} ✈️
            </h1>
            <HeroMessage ongoingTrips={ongoingTrips} nextTrip={nextTrip} />
          </div>
          <Link href="/trips/create" className="btn-primary flex-shrink-0">
            <Plus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {nextTrip && <TripCountdown trip={nextTrip} />}
      </div>

      {/* ── 6 Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Trips",   value: totalTrips,                    icon: Map,           color: "text-blue-500",    bg: "bg-blue-500/10",    sub: `${completedTrips.length} completed` },
          { label: "Upcoming",      value: upcomingTrips.length,          icon: Calendar,      color: "text-violet-500",  bg: "bg-violet-500/10",  sub: `${ongoingTrips.length} ongoing` },
          { label: "Budget",        value: formatCurrency(totalBudget),   icon: DollarSign,    color: "text-amber-500",   bg: "bg-amber-500/10",   sub: "total allocated" },
          { label: "Spent",         value: formatCurrency(totalSpent),    icon: TrendingUp,    color: "text-red-500",     bg: "bg-red-500/10",     sub: budgetLeft >= 0 ? `${formatCurrency(budgetLeft)} left` : "over budget" },
          { label: "Activities",    value: totalActivities,               icon: Zap,           color: "text-emerald-500", bg: "bg-emerald-500/10", sub: `across ${totalTrips} trips` },
          { label: "Notes",         value: notes,                         icon: BookOpen,      color: "text-pink-500",    bg: "bg-pink-500/10",    sub: "journal entries" },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="surface rounded-2xl p-4 card-lift">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="stat-number text-[1.4rem]">{value}</p>
            <p className="text-xs font-semibold text-[var(--color-text)] mt-1">{label}</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main Bento Grid ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent Trips — 2 cols */}
        <div className="lg:col-span-2 surface rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-[var(--color-primary)]" />
              <h2 className="font-bold text-[var(--color-text)]">My Trips</h2>
              <span className="text-xs mono text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                {totalTrips}
              </span>
            </div>
            <Link href="/trips" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-semibold">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-[var(--color-surface-2)] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Map className="w-7 h-7 text-[var(--color-muted)]" />
              </div>
              <p className="text-[var(--color-muted)] text-sm mb-4">No trips yet. Start planning!</p>
              <Link href="/trips/create" className="btn-primary text-xs py-2 px-4">
                <Plus className="w-3.5 h-3.5" /> Create your first trip
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {trips.slice(0, 5).map((trip) => {
                const spent = trip.stops.reduce((s, stop) => s + stop.activities.reduce((a, act) => a + act.cost, 0), 0);
                const pct = trip.totalBudget > 0 ? Math.min((spent / trip.totalBudget) * 100, 100) : 0;
                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.slug || trip.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl surface-2 hover:border-[var(--color-border-strong)] border border-transparent transition-all group card-lift"
                  >
                    {/* Cover thumbnail or letter */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                      {trip.coverImage ? (
                        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-[var(--color-primary)] flex items-center justify-center text-white font-black text-base">
                          {trip.title[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                          {trip.title}
                        </p>
                        {trip.isPublic && <Globe className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs mono text-[var(--color-muted)]">
                          {formatDate(trip.startDate)} · {trip._count.stops} stops · {getDaysBetween(trip.startDate, trip.endDate)}d
                        </p>
                      </div>
                      {trip.totalBudget > 0 && (
                        <div className="mt-1.5 h-1 bg-[var(--color-border)] rounded-full overflow-hidden w-24">
                          <div
                            className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : "bg-[var(--color-primary)]"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
                      {trip.totalBudget > 0 && (
                        <span className="text-xs mono text-[var(--color-muted)]">{formatCurrency(spent)}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Packing progress */}
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-500" />
                <h3 className="font-bold text-[var(--color-text)]">Packing</h3>
              </div>
              <Link href="/packing" className="text-xs text-[var(--color-primary)] font-semibold hover:underline">Manage</Link>
            </div>
            {totalPacking === 0 ? (
              <p className="text-xs text-[var(--color-muted)] text-center py-3">No packing items yet.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[var(--color-muted)]">
                    <span className="font-bold text-[var(--color-text)] mono">{packedCount}</span> / {totalPacking} packed
                  </p>
                  <p className="text-xs mono font-bold text-violet-500">
                    {Math.round((packedCount / totalPacking) * 100)}%
                  </p>
                </div>
                <div className="h-2.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${(packedCount / totalPacking) * 100}%` }}
                  />
                </div>
                {packedCount === totalPacking && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <p className="text-xs text-emerald-500 font-semibold">All packed!</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Budget health — dynamic */}
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-[var(--color-text)]">Budget Health</h3>
              </div>
              <Link href="/budget" className="text-xs text-[var(--color-primary)] font-semibold hover:underline">Details</Link>
            </div>
            {totalBudget === 0 ? (
              <p className="text-xs text-[var(--color-muted)] text-center py-3">No budget set yet.</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--color-muted)]">Used</span>
                  <span className="text-xs mono font-bold text-[var(--color-text)]">
                    {Math.round((totalSpent / totalBudget) * 100)}%
                  </span>
                </div>
                <div className="h-2.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)] mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? "bg-red-500" : "bg-amber-500"}`}
                    style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                  />
                </div>
                {/* Per-category mini bars */}
                <div className="space-y-2">
                  {([
                    { cat: "Hotel",      color: "bg-blue-500",    icon: "🏨" },
                    { cat: "Transport",  color: "bg-violet-500",  icon: "✈️" },
                    { cat: "Food",       color: "bg-amber-500",   icon: "🍽️" },
                    { cat: "Activities", color: "bg-emerald-500", icon: "🎯" },
                  ] as const).map(({ cat, color, icon }) => {
                    const amt = catSpend[cat as Cat];
                    const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-xs w-4">{icon}</span>
                        <div className="flex-1 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs mono text-[var(--color-muted)] w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center gap-1.5">
                  {totalSpent > totalBudget ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <p className={`text-xs font-semibold mono ${totalSpent > totalBudget ? "text-red-500" : "text-emerald-500"}`}>
                    {totalSpent > totalBudget
                      ? `Over by ${formatCurrency(totalSpent - totalBudget)}`
                      : `${formatCurrency(budgetLeft)} remaining`}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Trip status breakdown */}
          <div className="surface rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="font-bold text-[var(--color-text)]">Trip Status</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: "Upcoming",  count: upcomingTrips.length,  color: "bg-blue-500",    text: "text-blue-500" },
                { label: "Ongoing",   count: ongoingTrips.length,   color: "bg-emerald-500", text: "text-emerald-500" },
                { label: "Completed", count: completedTrips.length, color: "bg-[var(--color-muted)]", text: "text-[var(--color-muted)]" },
              ].map(({ label, count, color, text }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                  <p className="text-xs text-[var(--color-muted)] flex-1">{label}</p>
                  <p className={`text-xs font-black mono ${text}`}>{count}</p>
                  <div className="w-16 h-1.5 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: totalTrips > 0 ? `${(count / totalTrips) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trending Destinations ── */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--color-primary)]" />
            <h2 className="font-bold text-[var(--color-text)]">Trending Destinations</h2>
          </div>
          <Link href="/trips/create" className="text-xs text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1">
            Plan a trip <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {TRENDING.map(({ city, country, state, img, trend, tag }) => (
            <div key={city} className="dest-card relative rounded-xl overflow-hidden h-32 cursor-pointer card-lift border border-[var(--color-border)]">
              <img src={img} alt={city} className="dest-card-img absolute inset-0" />
              <div className="absolute inset-0 photo-overlay" />
              <div className="absolute top-2 left-2">
                <span className="text-xs bg-black/40 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">{tag}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-white font-bold text-xs leading-tight">{city}</p>
                <p className="text-white/60 text-xs">{state}</p>
                <p className="text-emerald-400 text-xs font-bold mono">{trend}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[var(--color-primary)]" />
          <h2 className="font-bold text-[var(--color-text)]">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 rounded-xl surface-2 hover:border-[var(--color-primary)]/30 border border-transparent transition-all card-lift group"
            >
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-text)] truncate">{label}</p>
                <p className="text-xs text-[var(--color-muted)]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Recent Spend Entries ── */}
      {recentEntries.length > 0 && (
        <div className="surface rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[var(--color-primary)]" />
              <h2 className="font-bold text-[var(--color-text)]">Recent Spend</h2>
              <span className="text-xs mono text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                {formatCurrency(totalSpent)} total
              </span>
            </div>
            <Link href="/budget" className="text-xs text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1">
              All entries <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Spend summary row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {([
              { cat: "Hotel",      color: "text-blue-500",    bg: "bg-blue-500/10",    icon: "🏨" },
              { cat: "Transport",  color: "text-violet-500",  bg: "bg-violet-500/10",  icon: "✈️" },
              { cat: "Food",       color: "text-amber-500",   bg: "bg-amber-500/10",   icon: "🍽️" },
              { cat: "Activities", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: "🎯" },
            ] as const).map(({ cat, color, bg, icon }) => (
              <div key={cat} className={`${bg} rounded-xl p-3 text-center`}>
                <p className="text-lg mb-1">{icon}</p>
                <p className={`text-xs font-black mono ${color}`}>{formatCurrency(catSpend[cat as Cat])}</p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">{cat}</p>
              </div>
            ))}
          </div>

          {/* Entry rows */}
          <div className="space-y-2">
            {recentEntries.map((entry, i) => {
              const catColors: Record<string, string> = {
                Hotel: "text-blue-500", Transport: "text-violet-500",
                Food: "text-amber-500", Activities: "text-emerald-500",
              };
              const catBg: Record<string, string> = {
                Hotel: "bg-blue-500/10", Transport: "bg-violet-500/10",
                Food: "bg-amber-500/10", Activities: "bg-emerald-500/10",
              };
              const catIcons: Record<string, string> = {
                Hotel: "🏨", Transport: "✈️", Food: "🍽️", Activities: "🎯",
              };
              return (
                <div key={i} className="flex items-center gap-3 p-3 surface-2 rounded-xl">
                  <div className={`w-9 h-9 ${catBg[entry.category] ?? "bg-[var(--color-surface-2)]"} rounded-xl flex items-center justify-center flex-shrink-0 text-base`}>
                    {catIcons[entry.category] ?? "💰"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">{entry.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${catColors[entry.category] ?? "text-[var(--color-muted)]"}`}>
                        {entry.category}
                      </span>
                      <span className="text-[var(--color-border-strong)]">·</span>
                      <span className="text-xs mono text-[var(--color-muted)]">{entry.tripTitle}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black mono text-[var(--color-text)]">{formatCurrency(entry.amount)}</p>
                    <p className="text-xs mono text-[var(--color-muted)]">{formatDate(entry.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Activity Feed ── */}
      {trips.length > 0 && (
        <div className="surface rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[var(--color-primary)]" />
            <h2 className="font-bold text-[var(--color-text)]">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {trips.slice(0, 3).flatMap((trip) =>
              trip.stops.slice(0, 1).map((stop) => ({
                type: "stop",
                tripTitle: trip.title,
                tripSlug: trip.slug || trip.id,
                city: stop.city,
                country: stop.country,
                date: formatDate(stop.arrivalDate),
                activities: stop.activities.length,
              }))
            ).slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 surface-2 rounded-xl">
                <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {item.city}, {item.country}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    in <Link href={`/trips/${item.tripSlug}`} className="text-[var(--color-primary)] hover:underline">{item.tripTitle}</Link>
                    {" · "}{item.activities} activities
                  </p>
                </div>
                <span className="text-xs mono text-[var(--color-muted)] flex-shrink-0">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
