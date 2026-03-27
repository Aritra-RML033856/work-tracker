import React from 'react';
import { Plus, Search } from 'lucide-react';
import { isoToday } from '../utils/helpers';

/**
 * Renders the dashboard header with controls.
 */
export function DashboardHeader({ 
  onSync, 
  isLoading, 
  cycleMode, 
  setCycleMode, 
  onAddOpen, 
  searchDate, 
  setSearchDate, 
  onSearch 
}) {
  return (
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
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-36 md:w-44 [color-scheme:dark]"
          />
          <button onClick={onSearch} className="text-white/50 hover:text-cyan-400 transition" title="Go to nearest available date">
            <Search className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={onSync}
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
          onClick={onAddOpen}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-cyan-400 text-black font-medium hover:bg-cyan-300 transition"
        >
          <Plus className="h-4 w-4" /> Add slide
        </button>
      </div>
    </div>
  );
}
