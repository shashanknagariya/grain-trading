import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface InfiniteScrollProps {
  children: React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loadMore,
  hasMore,
  loading = false,
  threshold = 200
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobileView } = useResponsiveLayout();

  const handleScroll = async () => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight <= threshold;

    if (scrolledToBottom) {
      setIsLoading(true);
      try {
        await loadMore();
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
      
      {(isLoading || loading) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 2
          }}
        >
          <CircularProgress size={isMobileView ? 24 : 32} />
        </Box>
      )}

      {!hasMore && (
        <Box
          sx={{
            textAlign: 'center',
            color: 'text.secondary',
            p: 2
          }}
        >
          No more items to load
        </Box>
      )}
    </Box>
  );
}; 