"use client";

import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { formatDate } from "@/utils";

export function TripCountdown({ trip }: { trip: { title: string; startDate: Date; _count: { stops: number } } }) {
  const [daysToTrip, setDaysToTrip] = useState<number | null>(null);

  useEffect(() => {
    const days = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000);
    setDaysToTrip(days);
  }, [trip.startDate]);

  if (daysToTrip === null || daysToTrip > 30) return null;

  return (
    <div className="relative z-10 mx-6 mb-5 flex items-center gap-3 p-3 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center flex-shrink-0">
        <Plane className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--color-text)] truncate">{trip.title}</p>
        <p className="text-xs text-[var(--color-muted)]">
          {formatDate(trip.startDate)} · {trip._count.stops} stops
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-black mono text-[var(--color-primary)]">{daysToTrip}</p>
        <p className="text-xs text-[var(--color-muted)]">days away</p>
      </div>
    </div>
  );
}
