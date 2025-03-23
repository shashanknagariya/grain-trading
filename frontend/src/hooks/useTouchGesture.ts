import { useRef } from 'react';

interface TouchConfig {
  onPull?: (distance: number) => void;
  onRelease?: () => void;
  threshold?: number;
}

export const useTouchGesture = ({
  onPull,
  onRelease,
  threshold = 50
}: TouchConfig) => {
  const touchStart = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const currentTouch = e.touches[0].clientY;
    const distance = currentTouch - touchStart.current;

    if (distance > threshold) {
      onPull?.(distance - threshold);
    }
  };

  const handleTouchEnd = () => {
    if (touchStart.current) {
      onRelease?.();
      touchStart.current = null;
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}; 