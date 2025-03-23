import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';

interface DashboardMetricsProps {
  metrics: {
    totalSales: number;
    totalPurchases: number;
    activeUsers: number;
  } | null;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return null;
  }

  const metricCards = [
    {
      title: 'Total Sales',
      value: metrics.totalSales,
      icon: <TrendingUpIcon color="primary" />,
    },
    {
      title: 'Total Purchases',
      value: metrics.totalPurchases,
      icon: <ShoppingCartIcon color="secondary" />,
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      icon: <PeopleIcon color="success" />,
    },
  ];

  return (
    <Grid container spacing={3}>
      {metricCards.map((card, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {card.icon}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {card.title}
              </Typography>
            </Box>
            <Typography variant="h4">
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}; 