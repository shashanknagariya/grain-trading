import { useState } from 'react';
import { getOptimizedImageUrl, generateSrcSet } from '../utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = ({
  src,
  alt,
  sizes = '100vw',
  className,
  width,
  height,
  loading = 'lazy'
}: OptimizedImageProps) => {
  const [isError, setIsError] = useState(false);

  const widths = [320, 640, 768, 1024, 1366, 1600];
  const srcSet = generateSrcSet(src, widths);
  const fallbackSrc = getOptimizedImageUrl(src, { width: 800 });

  return (
    <img
      src={isError ? src : fallbackSrc}
      srcSet={isError ? undefined : srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={() => setIsError(true)}
    />
  );
}; 