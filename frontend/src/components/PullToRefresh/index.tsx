import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const { isMobileView } = useResponsiveLayout();

  const THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = (e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!startY.current) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      setPullPosition(Math.min(diff * 0.5, MAX_PULL));
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullPosition > THRESHOLD && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    startY.current = null;
    setPullPosition(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isMobileView) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobileView, refreshing, pullPosition]);

  if (!isMobileView) return <>{children}</>;

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: -80,
          height: 80,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateY(${pullPosition}px)`,
          transition: pullPosition ? 'none' : 'transform 0.2s ease'
        }}
      >
        <CircularProgress
          size={30}
          sx={{
            opacity: pullPosition / THRESHOLD,
            transform: `rotate(${(pullPosition / MAX_PULL) * 360}deg)`
          }}
        />
      </Box>

      <Box
        sx={{
          transform: `translateY(${pullPosition}px)`,
          transition: pullPosition ? 'none' : 'transform 0.2s ease'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 