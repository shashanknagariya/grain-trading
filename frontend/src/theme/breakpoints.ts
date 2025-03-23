export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

export const isMobile = () => window.innerWidth < breakpoints.md;
export const isTablet = () => window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
export const isDesktop = () => window.innerWidth >= breakpoints.lg; 