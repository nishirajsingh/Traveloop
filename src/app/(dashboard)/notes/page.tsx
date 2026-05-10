"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, BookOpen, Edit2, Check, X, Search, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils";
import type { Note, Trip } from "@/types";

const NOTE_COLORS = [
  "border-l-blue-500",
  "border-l-violet-500",
  "border-l-amber-500",
  "border-l-emerald-500",
  "border-l-pink-500",
  "border-l-orange-500",
];

function NotesContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get("tripId");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState(tripId || "");
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [newNote, setNewNote] = useState({ title: "", content: "", date: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/trips").then((r) => r.json()).then((data) => {
      setTrips(data);
      if (!selectedTripId && data.length > 0) setSelectedTripId(data[0].id);
    });
  }, [selectedTripId]);

  useEffect(() => {
    if (!selectedTripId) return;
    fetch(`/api/notes?tripId=${selectedTripId}`).then((r) => r.json()).then(setNotes);
  }, [selectedTripId]);

  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return toast.error("Title and content required");
    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newNote, tripId: selectedTripId }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((p) => [note, ...p]);
      setNewNote({ title: "", content: "", date: "" });
      setShowForm(false);
      toast.success("Note added");
    }
    setLoading(false);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch("/api/notes", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) {
      setNotes((p) => p.map((n) => n.id === id ? { ...n, ...editForm } : n));
      setEditingId(null);
      toast.success("Note updated");
    }
  };

  const deleteNote = async (id: string) => {
    const res = await fetch("/api/notes", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { setNotes((p) => p.filter((n) => n.id !== id)); toast.success("Note deleted"); }
  };

  const filtered = notes.filter((n) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  );

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Trip selector */}
      <div className="surface rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Trip</p>
        <div className="flex gap-2 flex-wrap flex-1">
          {trips.map((t) => (
            <button key={t.id} onClick={() => setSelectedTripId(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedTripId === t.id
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}>
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* Stats + actions bar */}
      {selectedTripId && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="surface rounded-xl px-3 py-2 flex items-center gap-2 flex-shrink-0">
              <FileText className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="text-xs font-bold mono text-[var(--color-text)]">{notes.length}</span>
              <span className="text-xs text-[var(--color-muted)]">notes</span>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="input-base pl-9 py-2 text-xs"
              />
            </div>
          </div>
          <button onClick={() => { setShowForm(true); setSearch(""); }} className="btn-primary text-xs py-2 px-3 flex-shrink-0">
            <Plus className="w-3.5 h-3.5" /> New Note
          </button>
        </div>
      )}

      {/* New note form */}
      {showForm && (
        <div className="surface rounded-2xl p-5 space-y-4 border border-[var(--color-primary)]/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--color-text)]">New Note</p>
            <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Note title..."
            className="input-base text-base font-semibold"
            autoFocus
          />

          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Write your note, reminder, or journal entry..."
            rows={5}
            className="input-base resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-muted)]" />
              <input type="date" value={newNote.date} onChange={(e) => setNewNote({ ...newNote, date: e.target.value })} className="input-base py-1.5 text-xs w-auto" />
            </div>
            <div className="flex items-center gap-2">
              {newNote.content && (
                <span className="text-xs mono text-[var(--color-muted)]">{wordCount(newNote.content)} words</span>
              )}
              <button onClick={addNote} disabled={loading} className="btn-primary text-xs py-2 px-4 disabled:opacity-50">
                {loading ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes grid */}
      {filtered.length === 0 && !showForm ? (
        <div className="surface rounded-2xl p-16 text-center">
          <div className="w-14 h-14 bg-[var(--color-surface-2)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-[var(--color-muted)]" />
          </div>
          <p className="font-bold text-[var(--color-text)] mb-1">
            {search ? "No notes match your search" : "No notes yet"}
          </p>
          <p className="text-sm text-[var(--color-muted)] mb-4">
            {search ? "Try a different search term." : "Add notes, reminders, and journal entries for your trip."}
          </p>
          {!search && selectedTripId && (
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs py-2 px-4">
              <Plus className="w-3.5 h-3.5" /> Add Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note, i) => (
            <div key={note.id}
              className={`surface rounded-2xl overflow-hidden card-lift group border-l-4 ${NOTE_COLORS[i % NOTE_COLORS.length]}`}>
              {editingId === note.id ? (
                <div className="p-5 space-y-3">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="input-base font-semibold"
                    autoFocus
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={4}
                    className="input-base resize-none leading-relaxed"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(note.id)}
                      className="flex items-center gap-1.5 btn-primary text-xs py-1.5 px-3">
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost text-xs py-1.5 px-3">
                      Cancel
                    </button>
                    <span className="text-xs mono text-[var(--color-muted)] ml-auto">
                      {wordCount(editForm.content)} words
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[var(--color-text)] text-sm leading-snug flex-1">{note.title}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => { setEditingId(note.id); setEditForm({ title: note.title, content: note.content }); }}
                        className="w-7 h-7 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-muted)] flex items-center justify-center hover:text-[var(--color-primary)] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[var(--color-muted)]" />
                      <span className="text-xs mono text-[var(--color-muted)]">{formatDate(note.date)}</span>
                    </div>
                    <span className="text-xs mono text-[var(--color-muted)]">
                      {wordCount(note.content)}w
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">Notes & Journal</h1>
        <p className="text-[var(--color-muted)] text-sm mt-0.5">Keep track of your travel memories</p>
      </div>
      <Suspense fallback={<div className="surface rounded-2xl p-8 text-center text-[var(--color-muted)]">Loading...</div>}>
        <NotesContent />
      </Suspense>
    </div>
  );
}
