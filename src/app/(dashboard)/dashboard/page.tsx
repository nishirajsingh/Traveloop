import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Map, DollarSign, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, getDaysBetween, getTripStatus } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [trips, totalTrips] = await Promise.all([
    prisma.trip.findMany({
      where: { userId },
      include: { _count: { select: { stops: true } }, stops: { include: { activities: true } } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma.trip.count({ where: { userId } }),
  ]);

  const upcomingTrips = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === "upcoming");
  const totalBudget = trips.reduce((sum, t) => sum + t.totalBudget, 0);
  const totalSpent = trips.reduce(
    (sum, t) =>
      sum + t.stops.reduce((s, stop) => s + stop.activities.reduce((a, act) => a + act.cost, 0), 0),
    0
  );

  const trendingDestinations = [
    { city: "Tokyo", country: "Japan", emoji: "🇯🇵", trend: "+24%" },
    { city: "Paris", country: "France", emoji: "🇫🇷", trend: "+18%" },
    { city: "Bali", country: "Indonesia", emoji: "🇮🇩", trend: "+31%" },
    { city: "New York", country: "USA", emoji: "🇺🇸", trend: "+12%" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">Here&apos;s what&apos;s happening with your trips</p>
        </div>
        <Link
          href="/trips/create"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Trips", value: totalTrips, icon: Map, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Upcoming", value: upcomingTrips.length, icon: Calendar, color: "text-teal-400", bg: "bg-teal-500/10" },
          { label: "Total Budget", value: formatCurrency(totalBudget), icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: TrendingUp, color: "text-orange-400", bg: "bg-orange-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#94A3B8] font-medium uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Trips */}
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Trips</h2>
            <Link href="/trips" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#94A3B8] text-sm">No trips yet.</p>
              <Link href="/trips/create" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
                Create your first trip →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 4).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/40 hover:bg-[#0F172A]/70 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {trip.title[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {trip.title}
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        {formatDate(trip.startDate)} · {trip._count.stops} stops
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
                    <span className="text-xs text-[#94A3B8]">
                      {getDaysBetween(trip.startDate, trip.endDate)}d
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Trending Destinations */}
        <div className="glass rounded-xl p-5">
          <h2 className="font-semibold text-white mb-4">Trending Destinations</h2>
          <div className="space-y-3">
            {trendingDestinations.map(({ city, country, emoji, trend }) => (
              <div key={city} className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A]/40">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{city}</p>
                    <p className="text-xs text-[#94A3B8]">{country}</p>
                  </div>
                </div>
                <span className="text-xs text-teal-400 font-medium">{trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/trips/create", label: "Plan a Trip", icon: "✈️" },
            { href: "/budget", label: "Track Budget", icon: "💰" },
            { href: "/packing", label: "Packing List", icon: "🎒" },
            { href: "/notes", label: "Add Notes", icon: "📝" },
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#0F172A]/40 hover:bg-blue-500/10 hover:border-blue-500/30 border border-transparent transition-all text-center"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-[#94A3B8]">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
