import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Globe, Lock, Calendar, DollarSign, Share2 } from "lucide-react";
import { formatDate, getDaysBetween, formatCurrency } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";
import { ItineraryBuilder } from "@/components/shared/ItineraryBuilder";

type Props = { params: Promise<{ id: string }> };

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        include: { activities: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!trip) notFound();
  if (!trip.isPublic && trip.userId !== session?.user?.id) notFound();

  const totalSpent = trip.stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, a) => s + a.cost, 0),
    0
  );

  const publicUrl = `${process.env.NEXTAUTH_URL}/trip/public/${trip.id}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/trips" className="text-[#94A3B8] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{trip.title}</h1>
              {trip.isPublic ? (
                <Globe className="w-4 h-4 text-teal-400" />
              ) : (
                <Lock className="w-4 h-4 text-[#94A3B8]" />
              )}
            </div>
            {trip.description && <p className="text-[#94A3B8] text-sm">{trip.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
          {trip.isPublic && (
            <Link
              href={publicUrl}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Share2 className="w-3 h-3" /> Share
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Duration", value: `${getDaysBetween(trip.startDate, trip.endDate)} days`, icon: Calendar },
          { label: "Start", value: formatDate(trip.startDate), icon: Calendar },
          { label: "Budget", value: formatCurrency(trip.totalBudget), icon: DollarSign },
          { label: "Spent", value: formatCurrency(totalSpent), icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5 text-[#94A3B8]" />
              <p className="text-xs text-[#94A3B8]">{label}</p>
            </div>
            <p className="text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Budget Progress */}
      {trip.totalBudget > 0 && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">Budget Usage</p>
            <p className="text-sm text-[#94A3B8]">
              {formatCurrency(totalSpent)} / {formatCurrency(trip.totalBudget)}
            </p>
          </div>
          <div className="h-2 bg-[#334155] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                totalSpent > trip.totalBudget ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min((totalSpent / trip.totalBudget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[#94A3B8] mt-2">
            {totalSpent > trip.totalBudget
              ? `Over budget by ${formatCurrency(totalSpent - trip.totalBudget)}`
              : `${formatCurrency(trip.totalBudget - totalSpent)} remaining`}
          </p>
        </div>
      )}

      {/* Itinerary Builder */}
      <div className="glass rounded-xl p-5">
        <ItineraryBuilder tripId={trip.id} initialStops={trip.stops} />
      </div>

      {/* Navigation to sub-features */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { href: `/budget?tripId=${trip.id}`, label: "Budget Analytics", icon: "📊" },
          { href: `/packing?tripId=${trip.id}`, label: "Packing List", icon: "🎒" },
          { href: `/notes?tripId=${trip.id}`, label: "Trip Notes", icon: "📝" },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="glass rounded-xl p-4 flex items-center gap-3 hover:border-blue-500/30 border border-transparent transition-all"
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium text-white">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
