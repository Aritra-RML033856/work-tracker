import React, { useEffect, useMemo, useState } from 'react';
import { PencilLine, Trash2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

// Utils & Constants
import { isoToday, uid, clamp, formatDateLabel, seedSlides, getTimestamp } from '../utils/helpers';

// Hooks
import { useCarouselDrag } from '../hooks/useCarouselDrag';
import { useSheetSync } from '../hooks/useSheetSync';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Components
import { DashboardHeader } from './DashboardHeader';
import { CarouselSlide } from './CarouselSlide';
import { AddSlideModal, EditSlideModal, ReadMoreModal } from './SlideModals';

const GlobalStyles = () => (
  <style>{`
    .custom-scrollbar-mini::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
    .custom-scrollbar-mini::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; opacity: 0.6; }
    input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }
  `}</style>
);

export default function TextCarouselDashboard() {
  // --- State ---
  const [slides, setSlides] = useState(seedSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editIndex, setEditIndex] = useState(0);
  const [cycleMode, setCycleMode] = useState('weekly');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [readMoreSlide, setReadMoreSlide] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const [draft, setDraft] = useState({ title: '', content: '', date: isoToday() });
  const [addForm, setAddForm] = useState({ title: '', content: '', date: isoToday() });

  // --- Hooks ---
  const { fetchSheetData, isLoading, error: syncError } = useSheetSync();
  const { 
    isDragging, dragOffset, handleDragStart, handleDragMove, handleDragEnd 
  } = useCarouselDrag((delta) => {
    setActiveIndex((prev) => (prev + delta + slides.length) % slides.length);
  });

  useLocalStorage(
    { slides, activeIndex, editIndex, cycleMode },
    { setSlides, setActiveIndex, setEditIndex, setCycleMode }
  );

  // --- Effects ---
  useEffect(() => {
    const handleInitialSync = async () => {
      const newSlides = await fetchSheetData();
      if (newSlides && newSlides.length) {
        setSlides(newSlides);
        setActiveIndex(newSlides.length - 1);
      }
    };
    handleInitialSync();
  }, [fetchSheetData]);

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

  // --- Actions ---
  const handleSync = async () => {
    const newSlides = await fetchSheetData();
    if (newSlides && newSlides.length) {
      setSlides(newSlides);
      setActiveIndex(newSlides.length - 1);
    }
  };

  const handleSearch = () => {
    if (!searchDate) return;
    const today = isoToday();
    if (searchDate > today) {
      alert("Search is restricted to current or past dates.");
      setSearchDate(today);
      return;
    }

    const targetTs = new Date(searchDate).setHours(0, 0, 0, 0);
    const sortedSlides = [...slides]
      .map((s, originalIdx) => ({ ...s, ts: getTimestamp(s.date), originalIdx }))
      .sort((a, b) => a.ts - b.ts);

    const match = sortedSlides.find(s => s.ts >= targetTs);
    if (match) {
      setActiveIndex(match.originalIdx);
      setSearchDate('');
    } else if (sortedSlides.length > 0) {
      setActiveIndex(sortedSlides[sortedSlides.length - 1].originalIdx);
      setSearchDate('');
    }
  };

  const handleSaveEdit = () => {
    if (draft.date < isoToday()) {
      alert("Past dates are not allowed.");
      return;
    }
    setSlides((prev) => prev.map((s, idx) => (idx === editIndex ? { ...s, ...draft } : s)));
    setIsEditing(false);
  };

  const handleAddSlide = () => {
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

  const handleDeleteSlide = (index) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setIsEditing(false);
    setIsAddOpen(false);
  };

  const shift = (delta) => {
    if (!slides.length) return;
    setActiveIndex((prev) => (prev + delta + slides.length) % slides.length);
  };

  // --- Derived ---
  const activeSlide = slides[activeIndex];
  const visibleSlides = useMemo(() => {
    if (!slides.length) return [];
    const count = Math.min(slides.length, 7);
    const centered = Math.floor(count / 2);
    const result = [];
    for (let offset = -centered; offset <= centered; offset++) {
      const idx = (activeIndex + offset + slides.length) % slides.length;
      result.push({ slide: slides[idx], idx, offset });
    }
    return result;
  }, [slides, activeIndex]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <GlobalStyles />
      <div className="mx-auto max-w-7xl">
        <DashboardHeader 
          onSync={handleSync}
          isLoading={isLoading}
          cycleMode={cycleMode}
          setCycleMode={setCycleMode}
          onAddOpen={() => setIsAddOpen(true)}
          searchDate={searchDate}
          setSearchDate={setSearchDate}
          onSearch={handleSearch}
        />

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
              className={`relative mx-auto flex h-[480px] items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ perspective: '1600px', touchAction: 'none' }}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {visibleSlides.map(({ slide, idx, offset }) => (
                <CarouselSlide 
                  key={slide.id}
                  slide={slide}
                  idx={idx}
                  offset={offset}
                  activeIndex={activeIndex}
                  cycleMode={cycleMode}
                  dragOffset={dragOffset}
                  isDragging={isDragging}
                  onSelect={setActiveIndex}
                  onReadMore={setReadMoreSlide}
                />
              ))}
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
                onClick={() => { setEditIndex(activeIndex); setIsEditing(true); }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
              >
                <PencilLine className="h-4 w-4" /> Edit slide
              </button>
              <button
                onClick={() => handleDeleteSlide(activeIndex)}
                disabled={!slides.length}
                className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-100 hover:bg-red-500/20 transition disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" /> Delete slide
              </button>
            </div>
          </div>
        </div>

        {readMoreSlide && (
          <ReadMoreModal 
            slide={readMoreSlide} 
            onClose={() => setReadMoreSlide(null)} 
          />
        )}

        {isEditing && slides[editIndex] && (
          <EditSlideModal 
            draft={draft} 
            setDraft={setDraft} 
            onSave={handleSaveEdit} 
            onDelete={() => handleDeleteSlide(editIndex)} 
            onClose={() => setIsEditing(false)} 
          />
        )}

        {isAddOpen && (
          <AddSlideModal 
            addForm={addForm} 
            setAddForm={setAddForm} 
            onAdd={handleAddSlide} 
            onClose={() => setIsAddOpen(false)} 
          />
        )}
      </div>
    </div>
  );
}
