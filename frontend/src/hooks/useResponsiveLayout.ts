import { useState, useEffect } from 'react';
import { isMobile, isTablet } from '../theme/breakpoints';

export const useResponsiveLayout = () => {
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [isTabletView, setIsTabletView] = useState(isTablet());

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(isMobile());
      setIsTabletView(isTablet());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobileView,
    isTabletView,
    isDesktopView: !isMobileView && !isTabletView
  };
}; 