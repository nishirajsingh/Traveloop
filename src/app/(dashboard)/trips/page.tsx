"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Map, Trash2, Globe, Lock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDate, getDaysBetween } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";
import { TripCardSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Trip } from "@/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    const res = await fetch("/api/trips");
    if (res.ok) setTrips(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTrips(); }, []);

  const deleteTrip = async (id: string) => {
    if (!confirm("Delete this trip?")) return;
    const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTrips((prev) => prev.filter((t) => t.id !== id));
      toast.success("Trip deleted");
    } else {
      toast.error("Failed to delete trip");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Trips</h1>
          <p className="text-[#94A3B8] text-sm mt-1">{trips.length} trip{trips.length !== 1 ? "s" : ""} planned</p>
        </div>
        <Link
          href="/trips/create"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={<Map className="w-8 h-8" />}
          title="No trips yet"
          description="Start planning your next adventure by creating a new trip."
          action={
            <Link
              href="/trips/create"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Trip
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="glass rounded-xl p-5 hover:border-blue-500/30 border border-transparent transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {trip.title[0].toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  {trip.isPublic ? (
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  )}
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="text-[#94A3B8] hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Link href={`/trips/${trip.id}`}>
                <h3 className="font-semibold text-white hover:text-blue-400 transition-colors mb-1">
                  {trip.title}
                </h3>
              </Link>
              {trip.description && (
                <p className="text-xs text-[#94A3B8] mb-3 line-clamp-2">{trip.description}</p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-3">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(trip.startDate)}</span>
                <span>·</span>
                <span>{getDaysBetween(trip.startDate, trip.endDate)} days</span>
              </div>

              <div className="flex items-center justify-between">
                <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
                <span className="text-xs text-[#94A3B8]">
                  {(trip._count as { stops: number })?.stops ?? 0} stops
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
