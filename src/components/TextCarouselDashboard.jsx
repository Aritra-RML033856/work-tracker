import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, PencilLine, Save, Trash2, ChevronLeft, ChevronRight, CalendarDays, X, Search } from 'lucide-react';

const STORAGE_KEY = 'text-carousel-dashboard-v1';

const WEEKLY_PALETTE = [
  'from-sky-500 to-cyan-400',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
  'from-indigo-500 to-blue-400',
  'from-lime-500 to-green-400',
];

const MONTHLY_PALETTE = [
  'from-sky-500 to-cyan-400',
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
  'from-indigo-500 to-blue-400',
  'from-lime-500 to-green-400',
  'from-fuchsia-500 to-rose-400',
  'from-blue-500 to-indigo-400',
  'from-teal-500 to-emerald-400',
  'from-orange-500 to-amber-400',
  'from-purple-500 to-violet-400',
];

function isoToday() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function getPalette(mode) {
  return mode === 'monthly' ? MONTHLY_PALETTE : WEEKLY_PALETTE;
}

function getColorForIndex(index, mode) {
  const palette = getPalette(mode);
  return palette[index % palette.length];
}

function seedSlides() {
  return [
    {
      id: uid(),
      date: isoToday(),
      title: 'Daily Update',
      content: 'Write your work summary here. This slide can be edited, saved, and moved like a carousel card.',
    },
    {
      id: uid(),
      date: isoToday(),
      title: 'Coordination',
      content: 'Add short notes about discussions, follow-ups, and dependency tracking.',
    },
    {
      id: uid(),
      date: isoToday(),
      title: 'In Progress',
      content: 'Use this for the item you are currently handling.',
    },
  ];
}

const GlobalStyles = () => {
  return (
    <style>{`
      .custom-scrollbar-mini::-webkit-scrollbar {
        width: 3px;
      }
      .custom-scrollbar-mini::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar-mini::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
      }
      .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.4);
      }
      /* Date picker adjustments */
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
        opacity: 0.6;
      }
      input[type="date"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
      }
    `}</style>
  );
};

export default function TextCarouselDashboard() {
  const [slides, setSlides] = useState(seedSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editIndex, setEditIndex] = useState(0);
  const [cycleMode, setCycleMode] = useState('weekly'); // 'weekly' | 'monthly'
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', content: '', date: isoToday() });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', content: '', date: isoToday() });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [readMoreSlide, setReadMoreSlide] = useState(null);
  const [searchDate, setSearchDate] = useState('');

  const IS_LONG_LIMIT = 160;
  const TRUNCATE_LIMIT = 150;

  const fetchSheetData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vQcahiqDZXfIuW9clbf2XH0UNr7jcL6rOmui7Wn9Q3AkOcq3Fb_SKrxM1QbphTipFh4kmZIES7wsf4f/pub?output=csv');
      if (!response.ok) throw new Error('Failed to fetch sheet data');
      const csvText = await response.text();

      const parseCSV = (text) => {
        const result = [];
        let cur = '';
        let inQuote = false;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const next = text[i + 1];
          if (char === '"') {
            if (inQuote && next === '"') { cur += '"'; i++; }
            else inQuote = !inQuote;
          } else if (char === ',' && !inQuote) { result.push(cur.trim()); cur = ''; }
          else if (char === '\n' && !inQuote) { result.push(cur.trim()); cur = ''; break; }
          else if (char !== '\r') cur += char;
        }
        if (cur) result.push(cur.trim());

        const secondRowStart = text.indexOf('\n') + 1;
        const secondLineText = text.slice(secondRowStart);
        const secondRow = [];
        cur = '';
        inQuote = false;
        for (let i = 0; i < secondLineText.length; i++) {
          const char = secondLineText[i];
          const next = secondLineText[i + 1];
          if (char === '"') {
            if (inQuote && next === '"') { cur += '"'; i++; }
            else inQuote = !inQuote;
          } else if (char === ',' && !inQuote) { secondRow.push(cur.trim()); cur = ''; }
          else if (char === '\n' && !inQuote) { secondRow.push(cur.trim()); cur = ''; break; }
          else if (char !== '\r') cur += char;
        }
        if (cur) secondRow.push(cur.trim());

        return { headers: result, data: secondRow };
      };

      const { headers, data } = parseCSV(csvText);
      const newSlides = [];
      for (let i = 3; i < headers.length; i++) {
        if (headers[i] && data[i]) {
          newSlides.push({
            id: `sheet-${i}`,
            date: headers[i],
            title: 'Daily Log',
            content: data[i]
          });
        }
      }

      if (newSlides.length) {
        setSlides(newSlides);
        setActiveIndex(newSlides.length - 1);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  const goToDate = () => {
    if (!searchDate) return;
    
    const today = isoToday();
    if (searchDate > today) {
      alert("Search is restricted to current or past dates.");
      setSearchDate(today);
      return;
    }

    // Convert all slide dates to comparable date objects or timestamps
    const getTimestamp = (dStr) => {
      if (dStr.includes('-')) return new Date(dStr).setHours(0,0,0,0);
      // For '10th Jan' style, assume current year
      const parts = dStr.match(/(\d+)(st|nd|rd|th)\s+(.+)/);
      if (parts) {
        const d = new Date(`${parts[1]} ${parts[3]} ${new Date().getFullYear()}`);
        return d.setHours(0,0,0,0);
      }
      return 0;
    };

    const targetTs = new Date(searchDate).setHours(0,0,0,0);
    
    // Find exact match or the first date after (nearest next)
    // We sort the slides by date for this search
    const sortedSlides = [...slides]
      .map((s, originalIdx) => ({ ...s, ts: getTimestamp(s.date), originalIdx }))
      .sort((a, b) => a.ts - b.ts);

    const match = sortedSlides.find(s => s.ts >= targetTs);
    
    if (match) {
      setActiveIndex(match.originalIdx);
      setSearchDate('');
    } else {
      // If none found >= target, maybe set to the last one or show a message
      // User says "nearest next date slide", so if none exists after, maybe don't jump or jump to last.
      // Let's jump to the last slide as a fallback if the selected date is after all of them
      setActiveIndex(sortedSlides[sortedSlides.length - 1].originalIdx);
      setSearchDate('');
    }
  };

  useEffect(() => {
    // Only load from local storage if there are no slides yet (initial load fallback)
    if (slides.length === 3 && slides[0].title === 'Daily Update') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.slides) && parsed.slides.length) {
            setSlides(parsed.slides);
            setActiveIndex(clamp(parsed.activeIndex ?? 0, 0, parsed.slides.length - 1));
            setEditIndex(clamp(parsed.editIndex ?? 0, 0, parsed.slides.length - 1));
            setCycleMode(parsed.cycleMode === 'monthly' ? 'monthly' : 'weekly');
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ slides, activeIndex, editIndex, cycleMode })
      );
    } catch {
      // ignore
    }
  }, [slides, activeIndex, editIndex, cycleMode]);

  useEffect(() => {
    if (slides.length === 0) return;
    setActiveIndex((v) => clamp(v, 0, slides.length - 1));
    setEditIndex((v) => clamp(v, 0, slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    if (isEditing) {
      const current = slides[editIndex];
      if (current) setDraft({ title: current.title, content: current.content, date: current.date });
    }
  }, [isEditing, editIndex, slides]);

  const activeSlide = slides[activeIndex];
  const visibleCount = Math.min(slides.length, 7);
  const centered = Math.floor(visibleCount / 2);

  const visibleSlides = useMemo(() => {
    if (!slides.length) return [];
    const result = [];
    for (let offset = -centered; offset <= centered; offset++) {
      const idx = (activeIndex + offset + slides.length) % slides.length;
      result.push({ slide: slides[idx], idx, offset });
    }
    return result;
  }, [slides, activeIndex, centered]);

  const shift = (delta) => {
    if (!slides.length) return;
    setActiveIndex((prev) => (prev + delta + slides.length) % slides.length);
  };

  const openEditor = (index = activeIndex) => {
    setEditIndex(index);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (draft.date < isoToday()) {
      alert("Past dates are not allowed.");
      return;
    }
    setSlides((prev) =>
      prev.map((s, idx) => (idx === editIndex ? { ...s, ...draft } : s))
    );
    setIsEditing(false);
  };

  const addSlide = () => {
    if (!addForm.title.trim() && !addForm.content.trim()) return;
    
    if (addForm.date < isoToday()) {
      alert("Past dates are not allowed for new entries.");
      return;
    }

    const next = {
      id: uid(),
      date: addForm.date || isoToday(),
      title: addForm.title.trim() || 'Untitled',
      content: addForm.content.trim() || ' ',
    };
    setSlides((prev) => [...prev, next]);
    setActiveIndex(slides.length);
    setEditIndex(slides.length);
    setAddForm({ title: '', content: '', date: isoToday() });
    setIsAddOpen(false);
  };

  const deleteSlide = (index) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setIsEditing(false);
    setIsAddOpen(false);
  };

  const currentColor = activeSlide ? getColorForIndex(activeIndex, cycleMode) : WEEKLY_PALETTE[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <GlobalStyles />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Work Tracker Dashboard</h1>
            <p className="text-sm text-white/60 mt-1">
              Write, edit, save, and rotate text slides with date labels and repeating colors.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 focus-within:border-cyan-400 transition ml-auto group/search">
              <input
                type="date"
                max={isoToday()}
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goToDate()}
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-36 md:w-44 [color-scheme:dark]"
              />
              <button onClick={goToDate} className="text-white/50 hover:text-cyan-400 transition" title="Go to nearest available date">
                <Search className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={fetchSheetData}
              disabled={isLoading}
              className={`rounded-full px-4 py-2 text-sm border transition ${isLoading ? 'opacity-50 cursor-not-allowed' : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              {isLoading ? 'Syncing...' : 'Sync from Sheet'}
            </button>
            <button
              onClick={() => setCycleMode('weekly')}
              className={`rounded-full px-4 py-2 text-sm border transition ${cycleMode === 'weekly' ? 'bg-white text-black border-white' : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              Weekly colors
            </button>
            <button
              onClick={() => setCycleMode('monthly')}
              className={`rounded-full px-4 py-2 text-sm border transition ${cycleMode === 'monthly' ? 'bg-white text-black border-white' : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              Monthly colors
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-cyan-400 text-black font-medium hover:bg-cyan-300 transition"
            >
              <Plus className="h-4 w-4" /> Add slide
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl min-h-[640px]">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_42%)]" />

          <div className="relative px-4 py-6 md:px-8 md:py-10">
            <div className="flex items-center justify-between gap-3 mb-6">
              <button
                onClick={() => shift(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/80 hover:bg-black/60 transition"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>

              <div className="flex items-center gap-3 text-sm text-white/60">
                <CalendarDays className="h-4 w-4" />
                {activeSlide ? formatDateLabel(activeSlide.date) : 'No slide'}
              </div>

              <button
                onClick={() => shift(1)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/80 hover:bg-black/60 transition"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div
              className="relative mx-auto flex h-[480px] items-center justify-center"
              style={{ perspective: '1600px' }}
            >
              {visibleSlides.map(({ slide, idx, offset }) => {
                const abs = Math.abs(offset);
                const scale = offset === 0 ? 1 : 0.9 - abs * 0.06;
                const rotateY = offset * -28;
                const translateX = offset * 260;
                const translateZ = offset === 0 ? 0 : -abs * 80;
                const opacity = 1 - abs * 0.18;
                const gradient = getColorForIndex(idx, cycleMode);
                const isCenter = offset === 0;

                const isLong = slide.content.length > IS_LONG_LIMIT;
                const displayContent = isLong ? slide.content.slice(0, TRUNCATE_LIMIT) + '...' : slide.content;

                return (
                  <div
                    key={slide.id}
                    onClick={() => setActiveIndex(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveIndex(idx)}
                    className={`absolute w-[85vw] max-w-[320px] md:w-[380px] lg:w-[430px] text-left rounded-[2rem] border border-white/15 overflow-hidden transition-transform duration-500 ease-out cursor-pointer ${isCenter ? 'shadow-[0_30px_80px_rgba(0,0,0,0.55)]' : 'shadow-[0_12px_40px_rgba(0,0,0,0.28)]'}`}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity,
                      zIndex: 100 - abs,
                    }}
                  >
                    <div className={`h-[400px] md:h-[450px] lg:h-[480px] bg-gradient-to-br ${gradient} p-5 md:p-6 flex flex-col justify-between`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex items-center rounded-full bg-black/25 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                          <CalendarDays className="mr-1 h-3.5 w-3.5" /> {formatDateLabel(slide.date)}
                        </div>
                        <div className="rounded-full bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/80">
                          Slide {idx + 1}
                        </div>
                      </div>

                      <div className="pt-4 flex-grow flex flex-col min-h-0">
                        <div className="mb-2 text-[10px] uppercase tracking-wider text-white/50">{slide.title || 'Untitled'}</div>
                        <div className="overflow-hidden flex-grow group-hover:overflow-y-auto custom-scrollbar-mini">
                          <div className="text-lg md:text-xl lg:text-2xl font-semibold leading-tight text-white whitespace-pre-wrap">
                            {displayContent}
                          </div>
                        </div>
                        {isLong && isCenter && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setReadMoreSlide(slide); }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-black bg-white/90 hover:bg-white px-3 py-1.5 rounded-full transition shadow-lg active:scale-95"
                            >
                              READ MORE <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/15">
                        <span className="text-[10px] text-white/75 uppercase tracking-tighter">
                          {cycleMode === 'weekly' ? 'Weekly Colors' : 'Monthly Colors'}
                        </span>
                        <span className="text-[10px] text-white/75 uppercase tracking-tighter">Click to focus</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${idx === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/50'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => openEditor(activeIndex)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                <PencilLine className="h-4 w-4" /> Edit slide
              </button>
              <button
                onClick={() => deleteSlide(activeIndex)}
                disabled={!slides.length}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-100 hover:bg-red-500/20 transition disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" /> Delete slide
              </button>
            </div>
          </div>
        </div>

        {readMoreSlide && (
          <ModalShell title={`Details - ${formatDateLabel(readMoreSlide.date)}`} onClose={() => setReadMoreSlide(null)}>
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="mb-4 text-sm font-medium text-white/40 uppercase tracking-widest">{readMoreSlide.title}</div>
              <div className="text-lg md:text-xl leading-relaxed text-white/90 whitespace-pre-wrap">
                {readMoreSlide.content}
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setReadMoreSlide(null)}
                className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black hover:bg-white/90 transition"
              >
                Close
              </button>
            </div>
          </ModalShell>
        )}

        {isEditing && slides[editIndex] && (
          <ModalShell title="Edit slide" onClose={() => setIsEditing(false)}>
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
                  onClick={() => deleteSlide(editIndex)}
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-100 hover:bg-red-500/20 transition"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-300 transition"
                  >
                    <Save className="h-4 w-4" /> Save
                  </button>
                </div>
              </div>
            </div>
          </ModalShell>
        )}

        {isAddOpen && (
          <ModalShell title="Add new slide" onClose={() => setIsAddOpen(false)}>
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
                  onClick={() => setIsAddOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addSlide}
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-300 transition"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </ModalShell>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-white/70">{label}</span>
      {children}
    </label>
  );
}

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
