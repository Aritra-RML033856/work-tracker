import React from 'react';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { formatDateLabel, getColorForIndex } from '../utils/helpers';
import { IS_LONG_LIMIT, TRUNCATE_LIMIT } from '../utils/constants';

/**
 * Renders a single carousel slide.
 */
export function CarouselSlide({ 
  slide, 
  idx, 
  offset, 
  activeIndex, 
  cycleMode, 
  dragOffset, 
  isDragging, 
  onSelect, 
  onReadMore 
}) {
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
      onClick={() => onSelect(idx)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(idx)}
      className={`absolute w-[85vw] max-w-[320px] md:w-[380px] lg:w-[430px] text-left rounded-[2rem] border border-white/15 overflow-hidden transition-transform duration-500 ease-out ${isDragging ? '' : 'hover:scale-105'} ${isCenter ? 'shadow-[0_30px_80px_rgba(0,0,0,0.55)]' : 'shadow-[0_12px_40px_rgba(0,0,0,0.28)]'}`}
      style={{
        transform: `translateX(${translateX + dragOffset}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity,
        zIndex: 100 - abs,
        transition: isDragging ? 'none' : 'transform 0.5s ease-out, opacity 0.5s ease-out',
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
                onClick={(e) => { e.stopPropagation(); onReadMore(slide); }}
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
}
