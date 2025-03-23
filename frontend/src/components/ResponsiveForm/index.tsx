import React from 'react';
import { Box, Grid, useTheme, useMediaQuery } from '@mui/material';

interface ResponsiveFormProps {
  children: React.ReactNode;
  spacing?: number;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onSubmit?: (e: React.FormEvent) => void;
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  spacing = 2,
  maxWidth = 'md',
  onSubmit
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        width: '100%',
        maxWidth: theme.breakpoints.values[maxWidth],
        margin: '0 auto',
        padding: isMobile ? 2 : 3
      }}
    >
      <Grid container spacing={spacing}>
        {children}
      </Grid>
    </Box>
  );
}; 