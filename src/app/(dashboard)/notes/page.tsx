"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, BookOpen, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Note, Trip } from "@/types";

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

  useEffect(() => {
    fetch("/api/trips").then((r) => r.json()).then((data) => {
      setTrips(data);
      if (!selectedTripId && data.length > 0) setSelectedTripId(data[0].id);
    });
  }, [selectedTripId]);

  useEffect(() => {
    if (!selectedTripId) return;
    fetch(`/api/notes?tripId=${selectedTripId}`)
      .then((r) => r.json())
      .then(setNotes);
  }, [selectedTripId]);

  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return toast.error("Title and content required");
    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newNote, tripId: selectedTripId }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setNewNote({ title: "", content: "", date: "" });
      setShowForm(false);
      toast.success("Note added");
    }
    setLoading(false);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch("/api/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    if (res.ok) {
      const updated = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setEditingId(null);
      toast.success("Note updated");
    }
  };

  const deleteNote = async (id: string) => {
    const res = await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        {selectedTripId && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Note
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass rounded-xl p-5 space-y-3 border border-blue-500/30">
          <p className="text-sm font-medium text-white">New Note</p>
          <input
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Note title..."
            className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500"
          />
          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Write your note..."
            rows={4}
            className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-blue-500 resize-none"
          />
          <input
            type="date"
            value={newNote.date}
            onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
            className="px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={addNote}
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-xl transition-colors"
            >
              {loading ? "Saving..." : "Save Note"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No notes yet"
          description="Add notes, reminders, and journal entries for your trip."
          action={
            selectedTripId ? (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Note
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="glass rounded-xl p-5 group">
              {editingId === note.id ? (
                <div className="space-y-3">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#0F172A]/60 border border-[#334155] rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(note.id)} className="text-teal-400 hover:text-teal-300">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-[#94A3B8] hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white text-sm">{note.title}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingId(note.id); setEditForm({ title: note.title, content: note.content }); }}
                        className="text-[#94A3B8] hover:text-blue-400 transition-colors p-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-[#94A3B8] hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-[#475569] mt-3">{formatDate(note.date)}</p>
                </>
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Notes & Journal</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Keep track of your travel memories</p>
      </div>
      <Suspense fallback={<div className="glass rounded-xl p-8 text-center text-[#94A3B8]">Loading...</div>}>
        <NotesContent />
      </Suspense>
    </div>
  );
}
