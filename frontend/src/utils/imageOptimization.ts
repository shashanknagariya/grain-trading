interface ImageOptions {
  width: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export const getOptimizedImageUrl = (originalUrl: string, options: ImageOptions): string => {
  const baseUrl = import.meta.env.VITE_IMAGE_OPTIMIZATION_URL;
  const { width, quality = 80, format = 'webp' } = options;
  
  return `${baseUrl}?url=${encodeURIComponent(originalUrl)}&w=${width}&q=${quality}&fmt=${format}`;
};

export const generateSrcSet = (url: string, widths: number[]): string => {
  return widths
    .map(width => `${getOptimizedImageUrl(url, { width })} ${width}w`)
    .join(', ');
}; 