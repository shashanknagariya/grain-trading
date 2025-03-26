import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

export interface DashboardCardProps {
  title: string;
  value: string;
  color?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, color = '#1976d2' }) => {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ color }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};