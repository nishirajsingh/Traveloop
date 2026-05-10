import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe, Calendar, MapPin, DollarSign, Copy, Plane } from "lucide-react";
import { formatDate, getDaysBetween, formatCurrency } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";

type Props = { params: Promise<{ id: string }> };

export default async function PublicTripPage({ params }: Props) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id, isPublic: true },
    include: {
      stops: {
        include: { activities: true },
        orderBy: { order: "asc" },
      },
      user: { select: { name: true } },
    },
  });

  if (!trip) notFound();

  const totalSpent = trip.stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, a) => s + a.cost, 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="glass border-b border-[#334155] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Traveloop</span>
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-[#94A3B8]">Public Itinerary</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Trip Header */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{trip.title}</h1>
              {trip.description && <p className="text-[#94A3B8]">{trip.description}</p>}
              <p className="text-sm text-[#94A3B8] mt-2">by {trip.user.name}</p>
            </div>
            <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Duration", value: `${getDaysBetween(trip.startDate, trip.endDate)} days`, icon: Calendar },
              { label: "Start", value: formatDate(trip.startDate), icon: Calendar },
              { label: "Cities", value: `${trip.stops.length} stops`, icon: MapPin },
              { label: "Est. Cost", value: formatCurrency(totalSpent), icon: DollarSign },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[#0F172A]/40 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-[#94A3B8]" />
                  <p className="text-xs text-[#94A3B8]">{label}</p>
                </div>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Trip CTA */}
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Like this itinerary?</p>
            <p className="text-xs text-[#94A3B8]">Sign up to copy and customize it for yourself</p>
          </div>
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Trip
          </Link>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Itinerary</h2>
          {trip.stops.map((stop, index) => (
            <div key={stop.id} className="glass rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 p-5 border-b border-[#334155]/50">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{stop.city}, {stop.country}</h3>
                  <p className="text-xs text-[#94A3B8]">
                    {formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}
                  </p>
                </div>
                <span className="text-xs text-teal-400">
                  {formatCurrency(stop.activities.reduce((s, a) => s + a.cost, 0))}
                </span>
              </div>

              {stop.activities.length > 0 && (
                <div className="p-4 space-y-2">
                  {stop.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-[#0F172A]/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                          {activity.category}
                        </span>
                        <span className="text-sm text-white">{activity.title}</span>
                        {activity.duration && (
                          <span className="text-xs text-[#94A3B8]">· {activity.duration}</span>
                        )}
                      </div>
                      <span className="text-xs text-teal-400">{formatCurrency(activity.cost)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center py-8">
          <p className="text-[#94A3B8] mb-4">Plan your own trip with Traveloop</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <Plane className="w-4 h-4" />
            Start Planning for Free
          </Link>
        </div>
      </main>
    </div>
  );
}
