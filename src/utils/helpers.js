import { WEEKLY_PALETTE, MONTHLY_PALETTE } from './constants';

/**
 * Returns today's date in YYYY-MM-DD format (local timezone).
 */
export function isoToday() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

/**
 * Generates a simple random unique ID.
 */
export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Clamps a number between min and max.
 */
export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Formats a date string for display.
 */
export function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Gets the color palette based on the mode.
 */
export function getPalette(mode) {
  return mode === 'monthly' ? MONTHLY_PALETTE : WEEKLY_PALETTE;
}

/**
 * Gets a specific color from the palette based on index.
 */
export function getColorForIndex(index, mode) {
  const palette = getPalette(mode);
  return palette[index % palette.length];
}

/**
 * Initial slides for a new dashboard.
 */
export function seedSlides() {
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

/**
 * Gets a timestamp for a date string for sorting/searching.
 */
export function getTimestamp(dStr) {
  if (!dStr) return 0;
  if (dStr.includes('-')) return new Date(dStr).setHours(0, 0, 0, 0);
  
  // For '10th Jan' style, assume current year
  const parts = dStr.match(/(\d+)(st|nd|rd|th)\s+(.+)/);
  if (parts) {
    const d = new Date(`${parts[1]} ${parts[3]} ${new Date().getFullYear()}`);
    return d.setHours(0, 0, 0, 0);
  }
  return 0;
}
