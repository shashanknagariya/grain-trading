import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTouchGesture } from '../hooks/useTouchGesture';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePull = (distance: number) => {
    if (!isRefreshing) {
      setPullDistance(Math.min(distance, threshold));
    }
  };

  const handleRelease = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGesture({
    onPull: handlePull,
    onRelease: handleRelease,
    threshold
  });

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{ position: 'relative' }}
    >
      {(pullDistance > 0 || isRefreshing) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            transform: `translateY(${pullDistance}px)`
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      <Box
        sx={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? 'transform 0.2s' : 'none'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}; 