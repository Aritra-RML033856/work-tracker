import { useState } from 'react';
import { DRAG_THRESHOLD } from '../utils/constants';

/**
 * Handle drag/swipe logic for the carousel.
 */
export function useCarouselDrag(onShift) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.pageX || (e.touches && e.touches[0].pageX));
    setDragOffset(0);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX || (e.touches && e.touches[0].pageX);
    const walk = x - startX;
    setDragOffset(walk);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > DRAG_THRESHOLD) {
      onShift(-1);
    } else if (dragOffset < -DRAG_THRESHOLD) {
      onShift(1);
    }
    setDragOffset(0);
  };

  return {
    isDragging,
    dragOffset,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
