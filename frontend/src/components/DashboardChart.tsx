import React from 'react';
import { Box, Typography } from '@mui/material';

interface DashboardChartProps {
  data: any | null; // Replace with proper chart data type
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography color="text.secondary">
          No chart data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 300 }}>
      {/* Add your chart implementation here */}
      <Typography>Chart will be implemented here</Typography>
    </Box>
  );
}; 