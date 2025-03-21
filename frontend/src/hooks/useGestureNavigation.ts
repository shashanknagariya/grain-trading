import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GestureConfig {
  swipeThreshold?: number; // minimum distance for swipe
  velocityThreshold?: number; // minimum velocity for swipe
  enableBackGesture?: boolean; // enable/disable back gesture
  enableForwardGesture?: boolean; // enable/disable forward gesture
}

export const useGestureNavigation = ({
  swipeThreshold = 100,
  velocityThreshold = 0.5,
  enableBackGesture = true,
  enableForwardGesture = true
}: GestureConfig = {}) => {
  const navigate = useNavigate();
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const [isGesturing, setIsGesturing] = useState(false);
  const [gestureProgress, setGestureProgress] = useState(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
      setIsGesturing(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isGesturing) return;

      const deltaX = e.touches[0].clientX - touchStart.current.x;
      const deltaY = e.touches[0].clientY - touchStart.current.y;

      // Check if horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        
        // Calculate progress percentage
        const progress = Math.min(Math.abs(deltaX) / swipeThreshold, 1);
        setGestureProgress(deltaX > 0 ? progress : -progress);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isGesturing) return;

      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaTime = Date.now() - touchStart.current.time;
      const velocity = Math.abs(deltaX) / deltaTime;

      if (Math.abs(deltaX) >= swipeThreshold || velocity >= velocityThreshold) {
        if (deltaX > 0 && enableBackGesture) {
          navigate(-1); // Go back
        } else if (deltaX < 0 && enableForwardGesture) {
          navigate(1); // Go forward
        }
      }

      setIsGesturing(false);
      setGestureProgress(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, swipeThreshold, velocityThreshold, enableBackGesture, enableForwardGesture, isGesturing]);

  return {
    isGesturing,
    gestureProgress
  };
}; 