"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp, MapPin, DollarSign, Map } from "lucide-react";
import { toast } from "sonner";
import { CitySearch } from "@/components/shared/CitySearch";
import { formatDate, formatCurrency } from "@/utils";
import type { Stop, Activity, CitySearchResult } from "@/types";

// Dynamically import map to avoid SSR
const TripMap = dynamic(() => import("@/components/shared/TripMap").then((m) => m.TripMap), {
  ssr: false,
  loading: () => (
    <div className="h-64 glass rounded-xl flex items-center justify-center">
      <p className="text-sm text-[#94A3B8]">Loading map...</p>
    </div>
  ),
});

interface ItineraryBuilderProps {
  tripId: string;
  initialStops: Stop[];
}

function ActivityForm({ stopId, onAdd }: { stopId: string; onAdd: (a: Activity) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", cost: 0, category: "Activities", duration: "", description: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.title) return toast.error("Title required");
    setLoading(true);
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, stopId }),
    });
    if (res.ok) {
      onAdd(await res.json());
      setForm({ title: "", cost: 0, category: "Activities", duration: "", description: "" });
      setOpen(false);
      toast.success("Activity added");
    } else {
      toast.error("Failed to add activity");
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2"
      >
        <Plus className="w-3 h-3" /> Add Activity
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-[#0F172A]/60 rounded-xl space-y-2 border border-[#334155]">
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Activity title *"
        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
          placeholder="Cost ($)"
          className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {["Hotel", "Transport", "Food", "Activities"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <input
        value={form.duration}
        onChange={(e) => setForm({ ...form, duration: e.target.value })}
        placeholder="Duration (e.g. 2 hours)"
        className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 rounded-lg transition-colors"
        >
          {loading ? "Adding..." : "Add"}
        </button>
        <button onClick={() => setOpen(false)} className="px-3 py-2 text-xs text-[#94A3B8] hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SortableStop({
  stop, onDelete, onActivityAdd, onActivityDelete,
}: {
  stop: Stop;
  onDelete: (id: string) => void;
  onActivityAdd: (stopId: string, activity: Activity) => void;
  onActivityDelete: (stopId: string, activityId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const totalCost = stop.activities?.reduce((sum, a) => sum + a.cost, 0) ?? 0;

  const deleteActivity = async (activityId: string) => {
    const res = await fetch("/api/activities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activityId }),
    });
    if (res.ok) {
      onActivityDelete(stop.id, activityId);
      toast.success("Activity removed");
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="text-[#94A3B8] hover:text-white cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{stop.city}, {stop.country}</p>
          <p className="text-xs text-[#94A3B8]">
            {formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalCost > 0 && (
            <span className="text-xs text-teal-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />{formatCurrency(totalCost)}
            </span>
          )}
          <button onClick={() => setExpanded(!expanded)} className="text-[#94A3B8] hover:text-white transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(stop.id)} className="text-[#94A3B8] hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#334155]/50">
          <div className="pt-3 space-y-2">
            {stop.activities?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-2.5 bg-[#0F172A]/40 rounded-lg group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full flex-shrink-0">{activity.category}</span>
                  <span className="text-sm text-white truncate">{activity.title}</span>
                  {activity.duration && <span className="text-xs text-[#94A3B8] flex-shrink-0">· {activity.duration}</span>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-teal-400">{formatCurrency(activity.cost)}</span>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="text-[#94A3B8] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            <ActivityForm stopId={stop.id} onAdd={(a) => onActivityAdd(stop.id, a)} />
          </div>
        </div>
      )}
    </div>
  );
}

export function ItineraryBuilder({ tripId, initialStops }: ItineraryBuilderProps) {
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [addingStop, setAddingStop] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);
  const [stopForm, setStopForm] = useState({ arrivalDate: "", departureDate: "" });
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stops, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
    setStops(reordered);
    await Promise.all(
      reordered.map((s) =>
        fetch(`/api/stops/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: s.order }),
        })
      )
    );
  };

  const addStop = async () => {
    if (!selectedCity) return toast.error("Please select a city from the dropdown");
    if (!stopForm.arrivalDate || !stopForm.departureDate) return toast.error("Arrival and departure dates are required");

    setLoading(true);
    const res = await fetch("/api/stops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: selectedCity.name,
        country: selectedCity.country,
        arrivalDate: stopForm.arrivalDate,
        departureDate: stopForm.departureDate,
        tripId,
      }),
    });
    if (res.ok) {
      const stop = await res.json();
      setStops((prev) => [...prev, stop]);
      setSelectedCity(null);
      setStopForm({ arrivalDate: "", departureDate: "" });
      setAddingStop(false);
      toast.success(`${stop.city} added to itinerary`);
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || "Failed to add stop");
    }
    setLoading(false);
  };

  const deleteStop = async (id: string) => {
    const res = await fetch(`/api/stops/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStops((prev) => prev.filter((s) => s.id !== id));
      toast.success("Stop removed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Itinerary</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              showMap ? "bg-blue-500/20 text-blue-400" : "text-[#94A3B8] hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Map
          </button>
          <button
            onClick={() => setAddingStop(true)}
            className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Stop
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && <TripMap stops={stops} />}

      {/* Add Stop Form */}
      {addingStop && (
        <div className="glass rounded-xl p-4 space-y-3 border border-blue-500/30">
          <p className="text-sm font-medium text-white">New Stop</p>

          <CitySearch
            onSelect={(city) => setSelectedCity(city)}
            placeholder="Search and select a city..."
            value={selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : ""}
          />

          {/* Show selected city confirmation */}
          {selectedCity && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-500/10 border border-teal-500/30 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <span className="text-sm text-teal-400 font-medium">{selectedCity.name}, {selectedCity.country}</span>
              {selectedCity.population && (
                <span className="text-xs text-[#94A3B8] ml-auto">
                  Pop. {(selectedCity.population / 1_000_000).toFixed(1)}M
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">Arrival Date</label>
              <input
                type="date"
                value={stopForm.arrivalDate}
                onChange={(e) => setStopForm((f) => ({ ...f, arrivalDate: e.target.value }))}
                className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] mb-1 block">Departure Date</label>
              <input
                type="date"
                value={stopForm.departureDate}
                onChange={(e) => setStopForm((f) => ({ ...f, departureDate: e.target.value }))}
                className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addStop}
              disabled={loading || !selectedCity}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? "Adding..." : "Add Stop"}
            </button>
            <button
              onClick={() => { setAddingStop(false); setSelectedCity(null); setStopForm({ arrivalDate: "", departureDate: "" }); }}
              className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stops List */}
      {stops.length === 0 && !addingStop ? (
        <div className="text-center py-8 glass rounded-xl">
          <MapPin className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
          <p className="text-sm text-[#94A3B8]">No stops yet. Add your first city stop.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {stops.map((stop) => (
                <SortableStop
                  key={stop.id}
                  stop={stop}
                  onDelete={deleteStop}
                  onActivityAdd={(stopId, activity) =>
                    setStops((prev) =>
                      prev.map((s) =>
                        s.id === stopId ? { ...s, activities: [...(s.activities || []), activity] } : s
                      )
                    )
                  }
                  onActivityDelete={(stopId, activityId) =>
                    setStops((prev) =>
                      prev.map((s) =>
                        s.id === stopId
                          ? { ...s, activities: s.activities?.filter((a) => a.id !== activityId) }
                          : s
                      )
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
