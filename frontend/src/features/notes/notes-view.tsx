"use client";

import { Eye, NotebookPen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Markdown } from "@/components/learning/markdown";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/feedback";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { actions, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NotesView() {
  const notes = useStore((d) => d.notes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; body: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  const selected = notes.find((n) => n.id === selectedId) ?? null;
  const editing = draft ?? (selected ? { title: selected.title, body: selected.body } : null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  function startNew() {
    setSelectedId(null);
    setDraft({ title: "", body: "" });
    setPreview(false);
    setError(null);
  }

  function save() {
    if (!editing) return;
    if (!editing.title.trim()) {
      setError("Give the note a title.");
      return;
    }
    const id = actions.saveNote({ id: selected?.id, title: editing.title.trim(), body: editing.body, lessonSlug: selected?.lessonSlug });
    setSelectedId(id);
    setDraft(null);
    setError(null);
    notify("Note saved", "success");
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notes"
        description="Your personal notes, including those written on lesson pages. Markdown supported. Stored in this browser."
        actions={
          <Button onClick={startNew}>
            <Plus className="h-4 w-4" aria-hidden /> New note
          </Button>
        }
      />
      {notes.length === 0 && !editing ? (
        <EmptyState
          icon={NotebookPen}
          title="No notes yet"
          description="Create a note here, or use the notes panel at the bottom of any lesson."
          action={<Button onClick={startNew}>Write your first note</Button>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…" aria-label="Search notes" className="pl-9" />
            </div>
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto">
              {filtered.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(n.id);
                      setDraft(null);
                      setPreview(true);
                      setError(null);
                    }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left transition-colors",
                      n.id === selectedId ? "bg-accent-soft" : "hover:bg-surface-raised",
                    )}
                  >
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted">{n.body.slice(0, 80) || "Empty note"}</p>
                    <p className="mt-0.5 text-[11px] text-subtle">{new Date(n.updatedAt).toLocaleString()}</p>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-3 py-4 text-sm text-muted">No notes match.</li>}
            </ul>
          </div>

          <div className="min-w-0 rounded-xl border border-border bg-surface p-5">
            {!editing ? (
              <p className="py-10 text-center text-sm text-muted">Select a note or create a new one.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant={preview ? "secondary" : "primary"} size="sm" onClick={() => setPreview(false)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Button>
                  <Button variant={preview ? "primary" : "secondary"} size="sm" onClick={() => setPreview(true)}>
                    <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
                  </Button>
                  {selected?.lessonSlug && (
                    <Link href={`/search?q=${encodeURIComponent(selected.lessonSlug.replace(/-/g, " "))}`} className="text-xs text-muted hover:text-foreground">
                      Linked lesson →
                    </Link>
                  )}
                  {selected && (
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setConfirmDelete(true)}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                    </Button>
                  )}
                </div>
                {preview ? (
                  <div>
                    <h2 className="mb-2 text-lg font-semibold">{editing.title}</h2>
                    {editing.body ? <Markdown source={editing.body} /> : <p className="text-sm text-muted">This note is empty.</p>}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="note-title">Title</Label>
                      <Input
                        id="note-title"
                        value={editing.title}
                        aria-invalid={!!error}
                        aria-describedby={error ? "note-title-error" : undefined}
                        onChange={(e) => setDraft({ ...editing, title: e.target.value })}
                      />
                      <FieldError id="note-title-error" message={error ?? undefined} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note-body">Note</Label>
                      <textarea
                        id="note-body"
                        value={editing.body}
                        onChange={(e) => setDraft({ ...editing, body: e.target.value })}
                        rows={14}
                        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm leading-6 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                      />
                    </div>
                    <Button onClick={save}>Save note</Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this note?"
        description="This cannot be undone (unless you have an exported backup)."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (selected) actions.deleteNote(selected.id);
          setSelectedId(null);
          setDraft(null);
          setConfirmDelete(false);
          notify("Note deleted", "info");
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
