import React, { lazy, Suspense } from 'react';
import { CircularProgress } from '@mui/material';

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <CircularProgress />
  </div>
);

export function optimizedLazy<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(importFunc);
  return function OptimizedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export const preloadComponent = (path: string) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = path;
  document.head.appendChild(link);
};

export const preloadImage = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}; 