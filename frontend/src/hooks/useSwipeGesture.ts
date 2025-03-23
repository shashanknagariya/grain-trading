import { useRef } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}: SwipeConfig) => {
  const touchStart = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart.current - currentTouch;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
      touchStart.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStart.current = null;
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}; 