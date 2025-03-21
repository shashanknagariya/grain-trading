import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDown?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDown = 120
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const touchStartY = useRef(0);
  const pullRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = pullRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when scrolled to top
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;
      
      if (distance > 0 && window.scrollY === 0) {
        // Prevent default scroll
        e.preventDefault();
        
        // Apply resistance to pull
        const newDistance = Math.min(distance * 0.5, maxPullDown);
        setPullDistance(newDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      if (pullDistance >= pullDownThreshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, onRefresh, pullDownThreshold, maxPullDown]);

  return {
    pullRef,
    isPulling,
    isRefreshing,
    pullDistance
  };
}; 