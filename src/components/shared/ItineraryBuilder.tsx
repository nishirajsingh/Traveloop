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
import {
  GripVertical, Plus, Trash2, ChevronDown, ChevronUp,
  MapPin, Map, Calendar, DollarSign, Clock, Tag,
} from "lucide-react";
import { toast } from "sonner";
import { CitySearch } from "@/components/shared/CitySearch";
import { formatDate, formatCurrency } from "@/utils";
import type { Stop, Activity, CitySearchResult } from "@/types";

const TripMap = dynamic(() => import("@/components/shared/TripMap").then((m) => m.TripMap), {
  ssr: false,
  loading: () => (
    <div className="h-64 surface-2 rounded-xl flex items-center justify-center">
      <p className="text-sm text-[var(--color-muted)]">Loading map...</p>
    </div>
  ),
});

const CATEGORIES = ["Hotel", "Transport", "Food", "Activities"];
const CAT_ICONS: Record<string, string> = { Hotel: "🏨", Transport: "✈️", Food: "🍽️", Activities: "🎯" };

function ActivityForm({ stopId, onAdd }: { stopId: string; onAdd: (a: Activity) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", cost: 0, category: "Activities", duration: "", description: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.title.trim()) return toast.error("Title required");
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
        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> Add Activity
      </button>
    );
  }

  return (
    <div className="mt-3 p-4 surface-2 rounded-xl space-y-3 border border-[var(--color-primary)]/20">
      <p className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wide">New Activity</p>

      {/* Category selector */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setForm({ ...form, category: cat })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              form.category === cat
                ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {CAT_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Activity title *"
        className="input-base"
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
          <input
            type="number"
            min="0"
            value={form.cost || ""}
            onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
            placeholder="Cost (₹)"
            className="input-base pl-8"
          />
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
          <input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="Duration"
            className="input-base pl-9"
          />
        </div>
      </div>

      <input
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Notes (optional)"
        className="input-base"
      />

      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="btn-primary flex-1 justify-center py-2 text-xs disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Activity"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="btn-ghost px-3 py-2 text-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function SortableStop({
  stop, index, onDelete, onActivityAdd, onActivityDelete,
}: {
  stop: Stop;
  index: number;
  onDelete: (id: string) => void;
  onActivityAdd: (stopId: string, activity: Activity) => void;
  onActivityDelete: (stopId: string, activityId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const totalCost = stop.activities?.reduce((sum, a) => sum + a.cost, 0) ?? 0;

  const deleteActivity = async (activityId: string) => {
    const res = await fetch("/api/activities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activityId }),
    });
    if (res.ok) { onActivityDelete(stop.id, activityId); toast.success("Activity removed"); }
  };

  return (
    <div ref={setNodeRef} style={style} className="surface rounded-2xl overflow-hidden">
      {/* Stop header */}
      <div className="flex items-center gap-3 p-4 bg-[var(--color-surface-2)]">
        <button
          {...attributes}
          {...listeners}
          className="text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--color-text)] text-sm truncate">{stop.city}, {stop.country}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3 h-3 text-[var(--color-muted)]" />
            <p className="text-xs mono text-[var(--color-muted)]">
              {formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {totalCost > 0 && (
            <span className="text-xs font-bold mono text-emerald-500 hidden sm:block">
              {formatCurrency(totalCost)}
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(stop.id)}
            className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-2 border-t border-[var(--color-border)]">
          {stop.activities?.length === 0 && (
            <p className="text-xs text-[var(--color-muted)] py-1">No activities yet.</p>
          )}
          {stop.activities?.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 surface-2 rounded-xl group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex-shrink-0 font-semibold">
                  {CAT_ICONS[activity.category]} {activity.category}
                </span>
                <span className="text-sm font-medium text-[var(--color-text)] truncate">{activity.title}</span>
                {activity.duration && (
                  <span className="text-xs text-[var(--color-muted)] flex-shrink-0">· {activity.duration}</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-xs font-bold mono text-emerald-500">{formatCurrency(activity.cost)}</span>
                <button
                  onClick={() => deleteActivity(activity.id)}
                  className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          <ActivityForm stopId={stop.id} onAdd={(a) => onActivityAdd(stop.id, a)} />
        </div>
      )}
    </div>
  );
}

export function ItineraryBuilder({ tripId, initialStops }: { tripId: string; initialStops: Stop[] }) {
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
    if (!selectedCity) return toast.error("Please select a city");
    if (!stopForm.arrivalDate || !stopForm.departureDate) return toast.error("Dates are required");
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
      toast.success(`${stop.city} added`);
    } else {
      toast.error((await res.json().catch(() => ({}))).error || "Failed to add stop");
    }
    setLoading(false);
  };

  const deleteStop = async (id: string) => {
    const res = await fetch(`/api/stops/${id}`, { method: "DELETE" });
    if (res.ok) { setStops((prev) => prev.filter((s) => s.id !== id)); toast.success("Stop removed"); }
  };

  const totalTripCost = stops.reduce((sum, s) => sum + (s.activities?.reduce((a, act) => a + act.cost, 0) ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-[var(--color-text)]">Itinerary</h2>
          <span className="text-xs mono text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
            {stops.length} stops
          </span>
          {totalTripCost > 0 && (
            <span className="text-xs mono font-bold text-emerald-500">{formatCurrency(totalTripCost)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              showMap
                ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <Map className="w-3.5 h-3.5" /> Map
          </button>
          <button
            onClick={() => setAddingStop(true)}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stop
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && <TripMap stops={stops} />}

      {/* Add Stop Form */}
      {addingStop && (
        <div className="surface rounded-2xl p-5 space-y-4 border border-[var(--color-primary)]/20">
          <p className="text-sm font-bold text-[var(--color-text)]">New Stop</p>

          <CitySearch
            onSelect={(city) => setSelectedCity(city)}
            placeholder="Search and select a city..."
            value={selectedCity
              ? (selectedCity.region
                  ? `${selectedCity.name}, ${selectedCity.region}, ${selectedCity.country}`
                  : `${selectedCity.name}, ${selectedCity.country}`)
              : ""}
          />

          {selectedCity && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{selectedCity.name}</span>
                <span className="text-xs text-[var(--color-muted)] ml-1.5">
                  {selectedCity.region ? `${selectedCity.region}, ` : ""}{selectedCity.country}
                </span>
              </div>
              {selectedCity.population && (
                <span className="text-xs mono text-[var(--color-muted)]">
                  {selectedCity.population >= 1_000_000
                    ? `${(selectedCity.population / 1_000_000).toFixed(1)}M`
                    : `${(selectedCity.population / 1_000).toFixed(0)}K`}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Arrival Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
                <input
                  type="date"
                  value={stopForm.arrivalDate}
                  onChange={(e) => setStopForm((f) => ({ ...f, arrivalDate: e.target.value }))}
                  className="input-base pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Departure Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
                <input
                  type="date"
                  value={stopForm.departureDate}
                  onChange={(e) => setStopForm((f) => ({ ...f, departureDate: e.target.value }))}
                  className="input-base pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addStop}
              disabled={loading || !selectedCity}
              className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Stop"}
            </button>
            <button
              onClick={() => { setAddingStop(false); setSelectedCity(null); setStopForm({ arrivalDate: "", departureDate: "" }); }}
              className="btn-ghost px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stops list */}
      {stops.length === 0 && !addingStop ? (
        <div className="text-center py-10 surface-2 rounded-2xl border-2 border-dashed border-[var(--color-border)]">
          <MapPin className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--color-muted)]">No stops yet. Add your first city stop.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {stops.map((stop, i) => (
                <SortableStop
                  key={stop.id}
                  stop={stop}
                  index={i}
                  onDelete={deleteStop}
                  onActivityAdd={(stopId, activity) =>
                    setStops((prev) =>
                      prev.map((s) => s.id === stopId ? { ...s, activities: [...(s.activities || []), activity] } : s)
                    )
                  }
                  onActivityDelete={(stopId, activityId) =>
                    setStops((prev) =>
                      prev.map((s) => s.id === stopId ? { ...s, activities: s.activities?.filter((a) => a.id !== activityId) } : s)
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
