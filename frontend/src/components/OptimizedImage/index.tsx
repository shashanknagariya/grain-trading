import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
  className?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  aspectRatio = 1,
  className,
  priority = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isMobileView } = useResponsiveLayout();

  // Calculate dimensions
  const imageWidth = typeof width === 'number' ? `${width}px` : width || '100%';
  const imageHeight = height || (typeof width === 'number' ? `${width / aspectRatio}px` : 'auto');

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    const sizes = [320, 640, 768, 1024, 1366, 1600];
    return sizes
      .map(size => `${src}?w=${size} ${size}w`)
      .join(', ');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: imageWidth,
        height: imageHeight,
        overflow: 'hidden'
      }}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      
      {!error && (
        <img
          src={src}
          alt={alt}
          srcSet={generateSrcSet()}
          sizes={isMobileView ? '100vw' : '50vw'}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isLoading ? 'none' : 'block'
          }}
        />
      )}
    </Box>
  );
}; 