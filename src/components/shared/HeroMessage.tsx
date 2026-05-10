"use client";

import { useEffect, useState } from "react";

export function HeroMessage({ 
  ongoingTrips, 
  nextTrip 
}: { 
  ongoingTrips: { title: string }[]; 
  nextTrip: { startDate: Date } | null;
}) {
  const [message, setMessage] = useState("No upcoming trips. Start planning your next adventure!");

  useEffect(() => {
    if (ongoingTrips.length > 0) {
      setMessage(`You have an ongoing trip — ${ongoingTrips[0].title}`);
    } else if (nextTrip) {
      const days = Math.ceil((new Date(nextTrip.startDate).getTime() - Date.now()) / 86400000);
      setMessage(`Your next trip is in ${days} day${days !== 1 ? "s" : ""}`);
    }
  }, [ongoingTrips, nextTrip]);

  return <p className="text-[var(--color-muted)] text-sm mt-1">{message}</p>;
}
