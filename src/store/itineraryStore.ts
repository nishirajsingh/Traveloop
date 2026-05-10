import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip, Stop, Activity } from "@/types";

interface ItineraryState {
  currentTrip: Trip | null;
  stops: Stop[];
  setCurrentTrip: (trip: Trip | null) => void;
  setStops: (stops: Stop[]) => void;
  addStop: (stop: Stop) => void;
  updateStop: (id: string, data: Partial<Stop>) => void;
  removeStop: (id: string) => void;
  reorderStops: (stops: Stop[]) => void;
  addActivity: (stopId: string, activity: Activity) => void;
  removeActivity: (stopId: string, activityId: string) => void;
}

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set) => ({
      currentTrip: null,
      stops: [],
      setCurrentTrip: (trip) => set({ currentTrip: trip }),
      setStops: (stops) => set({ stops }),
      addStop: (stop) => set((s) => ({ stops: [...s.stops, stop] })),
      updateStop: (id, data) =>
        set((s) => ({
          stops: s.stops.map((stop) => (stop.id === id ? { ...stop, ...data } : stop)),
        })),
      removeStop: (id) => set((s) => ({ stops: s.stops.filter((s) => s.id !== id) })),
      reorderStops: (stops) => set({ stops }),
      addActivity: (stopId, activity) =>
        set((s) => ({
          stops: s.stops.map((stop) =>
            stop.id === stopId
              ? { ...stop, activities: [...(stop.activities || []), activity] }
              : stop
          ),
        })),
      removeActivity: (stopId, activityId) =>
        set((s) => ({
          stops: s.stops.map((stop) =>
            stop.id === stopId
              ? { ...stop, activities: stop.activities?.filter((a) => a.id !== activityId) }
              : stop
          ),
        })),
    }),
    { name: "traveloop-itinerary" }
  )
);
