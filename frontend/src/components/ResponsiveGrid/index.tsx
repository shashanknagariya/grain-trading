import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';

interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: number;
  minChildWidth?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 2,
  minChildWidth = 300
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getGridSize = () => {
    const containerWidth = isMobile ? window.innerWidth - 32 : minChildWidth;
    return Math.max(Math.floor(12 / (containerWidth / minChildWidth)), 3);
  };

  return (
    <Grid container spacing={spacing}>
      {React.Children.map(children, child => (
        <Grid item xs={12} sm={getGridSize()}>
          {child}
        </Grid>
      ))}
    </Grid>
  );
}; 