import { useEffect } from 'react';
import { STORAGE_KEY } from '../utils/constants';
import { clamp } from '../utils/helpers';

/**
 * Persists dashboard state to local storage.
 */
export function useLocalStorage(state, setters) {
  const { slides, activeIndex, editIndex, cycleMode } = state;
  const { setSlides, setActiveIndex, setEditIndex, setCycleMode } = setters;

  // Initial load
  useEffect(() => {
    // Only load from local storage if there are no slides yet (initial load fallback)
    // or if the slides are the default seed slides.
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
      } catch (err) {
        console.error('Failed to load from local storage', err);
      }
    }
  }, []);

  // Sync back to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ slides, activeIndex, editIndex, cycleMode })
      );
    } catch (err) {
      console.error('Failed to save to local storage', err);
    }
  }, [slides, activeIndex, editIndex, cycleMode]);
}
