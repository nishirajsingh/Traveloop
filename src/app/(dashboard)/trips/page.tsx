"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Map, Trash2, Globe, Lock, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDate, getDaysBetween } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";
import { TripCardSkeleton } from "@/components/shared/Skeletons";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Trip } from "@/types";

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=70",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=70",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=70",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=70",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=70",
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=70",
];

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
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">My Trips</h1>
          <p className="text-[var(--color-muted)] text-sm mt-0.5 mono">
            {trips.length} trip{trips.length !== 1 ? "s" : ""} planned
          </p>
        </div>
        <Link href="/trips/create" className="btn-primary">
          <Plus className="w-4 h-4" /> New Trip
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
            <Link href="/trips/create" className="btn-primary">
              <Plus className="w-4 h-4" /> Create Trip
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip, i) => {
            const coverImg = trip.coverImage || COVER_IMAGES[i % COVER_IMAGES.length];
            return (
              <div key={trip.id} className="surface rounded-2xl overflow-hidden card-lift group">
                {/* Cover image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={coverImg}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 photo-overlay" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {trip.isPublic ? (
                      <span className="flex items-center gap-1 text-xs bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-black/40 backdrop-blur-sm text-white/70 px-2 py-1 rounded-full">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="absolute top-3 left-3 w-7 h-7 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center text-white/60 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <Link href={`/trips/${trip.slug || trip.id}`}>
                    <h3 className="font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors mb-1 truncate">
                      {trip.title}
                    </h3>
                  </Link>
                  {trip.description && (
                    <p className="text-xs text-[var(--color-muted)] mb-3 line-clamp-2 leading-relaxed">{trip.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] mono">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(trip.startDate)}</span>
                      <span>·</span>
                      <span>{getDaysBetween(trip.startDate, trip.endDate)}d</span>
                    </div>
                    <Link
                      href={`/trips/${trip.slug || trip.id}`}
                      className="flex items-center gap-1 text-xs text-[var(--color-primary)] font-semibold hover:underline"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
