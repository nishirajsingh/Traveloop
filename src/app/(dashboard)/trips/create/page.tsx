"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Check, Loader2,
  MapPin, DollarSign, Package, Plane,
  Globe, Lock, Image as ImageIcon, Calendar,
  Plus, Trash2, Clock, Tag,
} from "lucide-react";
import Link from "next/link";
import { CitySearch } from "@/components/shared/CitySearch";
import type { CitySearchResult } from "@/types";

// ── Types ──────────────────────────────────────────────────────────
interface StopDraft {
  city: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  activities: ActivityDraft[];
}

interface ActivityDraft {
  title: string;
  category: string;
  cost: string;
  duration: string;
  description: string;
}

interface PackingDraft {
  name: string;
  category: string;
}

interface NoteDraft {
  title: string;
  content: string;
  date: string;
}

const ACTIVITY_CATEGORIES = ["Hotel", "Transport", "Food", "Activities"];
const PACKING_CATEGORIES = ["Clothing", "Electronics", "Documents", "Essentials"];
const CATEGORY_ICONS: Record<string, string> = {
  Hotel: "🏨", Transport: "✈️", Food: "🍽️", Activities: "🎯",
  Clothing: "👕", Electronics: "💻", Documents: "📄", Essentials: "🧴",
};

const STEPS = [
  { id: 1, label: "Basics",      icon: Plane },
  { id: 2, label: "Stops",       icon: MapPin },
  { id: 3, label: "Activities",  icon: Tag },
  { id: 4, label: "Extras",      icon: Package },
];

// ── Step Indicator ─────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                done    ? "bg-emerald-500 text-white" :
                active  ? "bg-[var(--color-primary)] text-white" :
                          "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]"
              }`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${
                active ? "text-[var(--color-primary)]" : done ? "text-emerald-500" : "text-[var(--color-muted)]"
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 transition-colors ${done ? "bg-emerald-500" : "bg-[var(--color-border)]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────────
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--color-muted)]">{hint}</p>}
    </div>
  );
}

// ── Step 1: Trip Basics ────────────────────────────────────────────
function Step1({
  data, onChange,
}: {
  data: {
    title: string; description: string; startDate: string;
    endDate: string; coverImage: string; totalBudget: string; isPublic: boolean;
  };
  onChange: (k: string, v: string | boolean) => void;
}) {
  const previewImages = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=70",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=70",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=70",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=70",
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=70",
    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=70",
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">Trip Basics</h2>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Give your trip a name, dates, and a cover photo.</p>
      </div>

      <Field label="Trip Title" required>
        <input
          value={data.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Summer Europe Adventure"
          className="input-base"
        />
      </Field>

      <Field label="Description" hint="What's the vibe? Solo trip, family vacation, backpacking?">
        <textarea
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe your trip..."
          rows={3}
          className="input-base resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Date" required>
          <input type="date" value={data.startDate} onChange={(e) => onChange("startDate", e.target.value)} className="input-base" />
        </Field>
        <Field label="End Date" required>
          <input type="date" value={data.endDate} onChange={(e) => onChange("endDate", e.target.value)} className="input-base" />
        </Field>
      </div>

      <Field label="Total Budget (₹)" hint="Your estimated total spend for the entire trip">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm font-semibold">₹</span>
          <input
            type="number"
            min="0"
            value={data.totalBudget}
            onChange={(e) => onChange("totalBudget", e.target.value)}
            placeholder="0"
            className="input-base pl-7"
          />
        </div>
      </Field>

      {/* Cover image picker */}
      <Field label="Cover Photo" hint="Pick a preset or paste your own URL">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {previewImages.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => onChange("coverImage", img)}
              className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${
                data.coverImage === img ? "border-[var(--color-primary)]" : "border-transparent hover:border-[var(--color-border-strong)]"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
              {data.coverImage === img && (
                <div className="absolute inset-0 bg-[var(--color-primary)]/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
          <input
            value={data.coverImage}
            onChange={(e) => onChange("coverImage", e.target.value)}
            placeholder="Or paste a custom image URL..."
            className="input-base pl-9"
          />
        </div>
        {data.coverImage && (
          <div className="mt-2 h-32 rounded-xl overflow-hidden border border-[var(--color-border)]">
            <img src={data.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
          </div>
        )}
      </Field>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          {data.isPublic ? <Globe className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-[var(--color-muted)]" />}
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {data.isPublic ? "Public trip" : "Private trip"}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              {data.isPublic ? "Anyone with the link can view this trip" : "Only you can see this trip"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange("isPublic", !data.isPublic)}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${data.isPublic ? "bg-emerald-500" : "bg-[var(--color-border-strong)]"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.isPublic ? "translate-x-5.5" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: City Stops ─────────────────────────────────────────────
function Step2({
  stops, tripStart, tripEnd,
  onAdd, onRemove, onChange,
}: {
  stops: StopDraft[];
  tripStart: string;
  tripEnd: string;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, k: keyof StopDraft, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">City Stops</h2>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Add every city you plan to visit in order.</p>
      </div>

      {stops.length === 0 && (
        <div className="surface-2 rounded-2xl p-8 text-center border-2 border-dashed border-[var(--color-border)]">
          <MapPin className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--color-muted)]">No stops yet. Add your first city below.</p>
        </div>
      )}

      <div className="space-y-4">
        {stops.map((stop, i) => (
          <div key={i} className="surface rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white text-xs font-black">
                  {i + 1}
                </div>
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {stop.city ? `${stop.city}, ${stop.country}` : `Stop ${i + 1}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <Field label="City" required>
              <CitySearch
                value={stop.city ? `${stop.city}, ${stop.country}` : ""}
                onSelect={(c: CitySearchResult) => {
                  onChange(i, "city", c.name);
                  onChange(i, "country", c.country);
                }}
                placeholder="Search for a city..."
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Arrival Date" required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
                  <input
                    type="date"
                    value={stop.arrivalDate}
                    min={tripStart}
                    max={tripEnd}
                    onChange={(e) => onChange(i, "arrivalDate", e.target.value)}
                    className="input-base pl-9"
                  />
                </div>
              </Field>
              <Field label="Departure Date" required>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
                  <input
                    type="date"
                    value={stop.departureDate}
                    min={stop.arrivalDate || tripStart}
                    max={tripEnd}
                    onChange={(e) => onChange(i, "departureDate", e.target.value)}
                    className="input-base pl-9"
                  />
                </div>
              </Field>
            </div>

            {stop.arrivalDate && stop.departureDate && (
              <p className="text-xs mono text-[var(--color-primary)]">
                {Math.max(0, Math.ceil((new Date(stop.departureDate).getTime() - new Date(stop.arrivalDate).getTime()) / 86400000))} nights in {stop.city || "this city"}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all text-sm font-semibold"
      >
        <Plus className="w-4 h-4" /> Add City Stop
      </button>
    </div>
  );
}

// ── Step 3: Activities ─────────────────────────────────────────────
function Step3({
  stops, onChange,
}: {
  stops: StopDraft[];
  onChange: (stopIdx: number, acts: ActivityDraft[]) => void;
}) {
  const addActivity = (si: number) => {
    const updated = [...stops[si].activities, { title: "", category: "Activities", cost: "", duration: "", description: "" }];
    onChange(si, updated);
  };

  const removeActivity = (si: number, ai: number) => {
    const updated = stops[si].activities.filter((_, idx) => idx !== ai);
    onChange(si, updated);
  };

  const updateActivity = (si: number, ai: number, k: keyof ActivityDraft, v: string) => {
    const updated = stops[si].activities.map((a, idx) => idx === ai ? { ...a, [k]: v } : a);
    onChange(si, updated);
  };

  if (stops.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">Activities</h2>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Add activities, hotels, and transport for each stop.</p>
        </div>
        <div className="surface-2 rounded-2xl p-8 text-center border-2 border-dashed border-[var(--color-border)]">
          <Tag className="w-8 h-8 text-[var(--color-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--color-muted)]">Add city stops first to plan activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">Activities</h2>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Add activities, hotels, and transport for each stop.</p>
      </div>

      {stops.map((stop, si) => (
        <div key={si} className="surface rounded-2xl overflow-hidden">
          {/* Stop header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <div className="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {si + 1}
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-text)]">{stop.city || `Stop ${si + 1}`}{stop.country ? `, ${stop.country}` : ""}</p>
              {stop.arrivalDate && stop.departureDate && (
                <p className="text-xs mono text-[var(--color-muted)]">{stop.arrivalDate} → {stop.departureDate}</p>
              )}
            </div>
            <div className="ml-auto">
              <span className="text-xs mono font-semibold text-emerald-500">
                ₹{stop.activities.reduce((s, a) => s + (parseFloat(a.cost) || 0), 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {stop.activities.map((act, ai) => (
              <div key={ai} className="surface-2 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateActivity(si, ai, "category", cat)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          act.category === cat
                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]"
                            : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                        }`}
                      >
                        {CATEGORY_ICONS[cat]} {cat}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeActivity(si, ai)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors flex-shrink-0 ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Activity Title" required>
                    <input
                      value={act.title}
                      onChange={(e) => updateActivity(si, ai, "title", e.target.value)}
                      placeholder="e.g. Eiffel Tower visit"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Cost (₹)">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
                      <input
                        type="number"
                        min="0"
                        value={act.cost}
                        onChange={(e) => updateActivity(si, ai, "cost", e.target.value)}
                        placeholder="0"
                        className="input-base pl-8"
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Duration">
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
                      <input
                        value={act.duration}
                        onChange={(e) => updateActivity(si, ai, "duration", e.target.value)}
                        placeholder="e.g. 2 hours"
                        className="input-base pl-9"
                      />
                    </div>
                  </Field>
                  <Field label="Notes">
                    <input
                      value={act.description}
                      onChange={(e) => updateActivity(si, ai, "description", e.target.value)}
                      placeholder="Any extra details..."
                      className="input-base"
                    />
                  </Field>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addActivity(si)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Activity
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Step 4: Extras (Packing + Notes) ──────────────────────────────
function Step4({
  packing, notes,
  onAddPacking, onRemovePacking, onChangePacking,
  onAddNote, onRemoveNote, onChangeNote,
}: {
  packing: PackingDraft[];
  notes: NoteDraft[];
  onAddPacking: () => void;
  onRemovePacking: (i: number) => void;
  onChangePacking: (i: number, k: keyof PackingDraft, v: string) => void;
  onAddNote: () => void;
  onRemoveNote: (i: number) => void;
  onChangeNote: (i: number, k: keyof NoteDraft, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">Extras</h2>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">Optional — add packing items and trip notes.</p>
      </div>

      {/* Packing List */}
      <div className="surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[var(--color-primary)]" />
            <h3 className="font-bold text-[var(--color-text)]">Packing List</h3>
            <span className="text-xs mono text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
              {packing.length}
            </span>
          </div>
          <button type="button" onClick={onAddPacking} className="btn-primary text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>

        {packing.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] text-center py-4">No items yet. Add things you need to pack.</p>
        ) : (
          <div className="space-y-2">
            {packing.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={item.name}
                  onChange={(e) => onChangePacking(i, "name", e.target.value)}
                  placeholder="Item name..."
                  className="input-base flex-1"
                />
                <select
                  value={item.category}
                  onChange={(e) => onChangePacking(i, "category", e.target.value)}
                  className="input-base w-36"
                >
                  {PACKING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemovePacking(i)}
                  className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="surface rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[var(--color-primary)]" />
            <h3 className="font-bold text-[var(--color-text)]">Trip Notes</h3>
            <span className="text-xs mono text-[var(--color-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
              {notes.length}
            </span>
          </div>
          <button type="button" onClick={onAddNote} className="btn-primary text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" /> Add Note
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] text-center py-4">No notes yet. Add reminders or journal entries.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note, i) => (
              <div key={i} className="surface-2 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={note.title}
                    onChange={(e) => onChangeNote(i, "title", e.target.value)}
                    placeholder="Note title..."
                    className="input-base flex-1"
                  />
                  <input
                    type="date"
                    value={note.date}
                    onChange={(e) => onChangeNote(i, "date", e.target.value)}
                    className="input-base w-40"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveNote(i)}
                    className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  value={note.content}
                  onChange={(e) => onChangeNote(i, "content", e.target.value)}
                  placeholder="Write your note..."
                  rows={2}
                  className="input-base resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function CreateTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state
  const [basics, setBasics] = useState({
    title: "", description: "", startDate: "", endDate: "",
    coverImage: "", totalBudget: "", isPublic: false,
  });

  // Step 2 state
  const [stops, setStops] = useState<StopDraft[]>([]);

  // Step 4 state
  const [packing, setPacking] = useState<PackingDraft[]>([]);
  const [notes, setNotes] = useState<NoteDraft[]>([]);

  // ── Validation per step ──
  const canNext = () => {
    if (step === 1) {
      if (!basics.title.trim()) { toast.error("Trip title is required"); return false; }
      if (!basics.startDate)    { toast.error("Start date is required"); return false; }
      if (!basics.endDate)      { toast.error("End date is required"); return false; }
      if (new Date(basics.endDate) < new Date(basics.startDate)) { toast.error("End date must be after start date"); return false; }
      return true;
    }
    if (step === 2) {
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i];
        if (!s.city)           { toast.error(`Stop ${i + 1}: city is required`); return false; }
        if (!s.arrivalDate)    { toast.error(`Stop ${i + 1}: arrival date is required`); return false; }
        if (!s.departureDate)  { toast.error(`Stop ${i + 1}: departure date is required`); return false; }
        if (new Date(s.departureDate) < new Date(s.arrivalDate)) { toast.error(`Stop ${i + 1}: departure must be after arrival`); return false; }
      }
      return true;
    }
    if (step === 3) {
      for (let si = 0; si < stops.length; si++) {
        for (let ai = 0; ai < stops[si].activities.length; ai++) {
          if (!stops[si].activities[ai].title.trim()) {
            toast.error(`Stop ${si + 1}, activity ${ai + 1}: title is required`);
            return false;
          }
        }
      }
      return true;
    }
    return true;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Create trip
      const tripRes = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: basics.title,
          description: basics.description || "",
          startDate: basics.startDate,
          endDate: basics.endDate,
          coverImage: basics.coverImage || "",
          isPublic: basics.isPublic,
          totalBudget: parseFloat(basics.totalBudget) || 0,
        }),
      });
      if (!tripRes.ok) {
        const j = await tripRes.json().catch(() => ({}));
        toast.error(j.error || "Failed to create trip");
        return;
      }
      const trip = await tripRes.json();

      // 2. Create stops + activities
      for (const stop of stops) {
        const stopRes = await fetch("/api/stops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: stop.city, country: stop.country,
            arrivalDate: stop.arrivalDate, departureDate: stop.departureDate,
            tripId: trip.id,
          }),
        });
        if (!stopRes.ok) continue;
        const createdStop = await stopRes.json();

        for (const act of stop.activities) {
          if (!act.title.trim()) continue;
          await fetch("/api/activities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: act.title,
              description: act.description || "",
              cost: parseFloat(act.cost) || 0,
              duration: act.duration || "",
              category: act.category,
              stopId: createdStop.id,
            }),
          });
        }
      }

      // 3. Create packing items
      for (const item of packing) {
        if (!item.name.trim()) continue;
        await fetch("/api/packing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: item.name, category: item.category, tripId: trip.id }),
        });
      }

      // 4. Create notes
      for (const note of notes) {
        if (!note.title.trim() || !note.content.trim()) continue;
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: note.title, content: note.content,
            date: note.date || basics.startDate,
            tripId: trip.id,
          }),
        });
      }

      toast.success("Trip created successfully! 🎉");
      router.push(`/trips/${trip.slug || trip.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/trips"
          className="w-9 h-9 surface rounded-xl flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors card-lift flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">Create New Trip</h1>
          <p className="text-[var(--color-muted)] text-sm">Step {step} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step content */}
      {step === 1 && (
        <Step1
          data={basics}
          onChange={(k, v) => setBasics((prev) => ({ ...prev, [k]: v }))}
        />
      )}

      {step === 2 && (
        <Step2
          stops={stops}
          tripStart={basics.startDate}
          tripEnd={basics.endDate}
          onAdd={() => setStops((prev) => [...prev, { city: "", country: "", arrivalDate: "", departureDate: "", activities: [] }])}
          onRemove={(i) => setStops((prev) => prev.filter((_, idx) => idx !== i))}
          onChange={(i, k, v) => setStops((prev) => prev.map((s, idx) => idx === i ? { ...s, [k]: v } : s))}
        />
      )}

      {step === 3 && (
        <Step3
          stops={stops}
          onChange={(si, acts) => setStops((prev) => prev.map((s, idx) => idx === si ? { ...s, activities: acts } : s))}
        />
      )}

      {step === 4 && (
        <Step4
          packing={packing}
          notes={notes}
          onAddPacking={() => setPacking((p) => [...p, { name: "", category: "Essentials" }])}
          onRemovePacking={(i) => setPacking((p) => p.filter((_, idx) => idx !== i))}
          onChangePacking={(i, k, v) => setPacking((p) => p.map((item, idx) => idx === i ? { ...item, [k]: v } : item))}
          onAddNote={() => setNotes((n) => [...n, { title: "", content: "", date: "" }])}
          onRemoveNote={(i) => setNotes((n) => n.filter((_, idx) => idx !== i))}
          onChangeNote={(i, k, v) => setNotes((n) => n.map((note, idx) => idx === i ? { ...note, [k]: v } : note))}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 1}
          className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                s.id === step ? "w-6 bg-[var(--color-primary)]" :
                s.id < step  ? "w-3 bg-emerald-500" :
                               "w-3 bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={() => { if (canNext()) setStep((s) => s + 1); }}
            className="btn-primary"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { if (canNext()) handleSubmit(); }}
            disabled={submitting}
            className="btn-primary disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {submitting ? "Creating..." : "Create Trip"}
          </button>
        )}
      </div>
    </div>
  );
}
