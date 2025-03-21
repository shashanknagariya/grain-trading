import { ReactNode } from 'react';
import { CircularProgress } from '@mui/material';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import '../styles/pull-to-refresh.css';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const { pullRef, isPulling, isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh
  });

  return (
    <div ref={pullRef} className="pull-to-refresh-container">
      <div 
        className="pull-to-refresh-indicator"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance / 80
        }}
      >
        {isRefreshing ? (
          <CircularProgress size={24} />
        ) : (
          <span>↓ Pull to refresh</span>
        )}
      </div>
      {children}
    </div>
  );
}; 