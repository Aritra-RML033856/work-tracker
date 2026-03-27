import React, { useRef, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { isoToday, formatDateLabel } from '../utils/helpers';

/**
 * Base Modal Shell component.
 */
function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-neutral-950 p-5 md:p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 transition"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-semibold text-white mb-5 pr-8">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/**
 * Form field component.
 */
function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}

/**
 * Read More Modal.
 */
export function ReadMoreModal({ slide, onClose }) {
  if (!slide) return null;
  return (
    <ModalShell title={`Details - ${formatDateLabel(slide.date)}`} onClose={onClose}>
      <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="mb-4 text-sm font-medium text-white/40 uppercase tracking-widest">{slide.title}</div>
        <div className="text-lg md:text-xl leading-relaxed text-white/90 whitespace-pre-wrap">
          {slide.content}
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black hover:bg-white/90 transition"
        >
          Close
        </button>
      </div>
    </ModalShell>
  );
}

/**
 * Edit Slide Modal.
 */
export function EditSlideModal({ draft, setDraft, onSave, onDelete, onClose }) {
  const contentRef = useRef(null);

  return (
    <ModalShell title="Edit slide" onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Date">
          <input
            type="date"
            min={isoToday()}
            value={draft.date}
            onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-cyan-400 [color-scheme:dark]"
          />
        </Field>
        <Field label="Title">
          <input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            placeholder="Slide title"
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </Field>
        <Field label="Content">
          <textarea
            ref={contentRef}
            value={draft.content}
            onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
            placeholder="Write the text for this slide"
            rows={8}
            className="w-full resize-y rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </Field>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-100 hover:bg-red-500/20 transition"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-300 transition"
            >
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/**
 * Add Slide Modal.
 */
export function AddSlideModal({ addForm, setAddForm, onAdd, onClose }) {
  return (
    <ModalShell title="Add new slide" onClose={onClose}>
      <div className="grid gap-4">
        <Field label="Date">
          <input
            type="date"
            min={isoToday()}
            value={addForm.date}
            onChange={(e) => setAddForm((p) => ({ ...p, date: e.target.value }))}
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-cyan-400 [color-scheme:dark]"
          />
        </Field>
        <Field label="Title">
          <input
            value={addForm.title}
            onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Slide title"
            className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </Field>
        <Field label="Content">
          <textarea
            value={addForm.content}
            onChange={(e) => setAddForm((p) => ({ ...p, content: e.target.value }))}
            placeholder="Write the text for this slide"
            rows={8}
            className="w-full resize-y rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-300 transition"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
