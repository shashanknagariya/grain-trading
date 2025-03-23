import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardCard } from '../components/DashboardCard';
import { DashboardChart } from '../components/DashboardChart';
import { DashboardMetrics } from '../components/DashboardMetrics';

export const Dashboard: React.FC = () => {
  const { isMobileView } = useResponsiveLayout();
  const { 
    metrics, 
    chartData, 
    recentActivity,
    isLoading,
    error 
  } = useDashboardData();

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={3} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          Error loading dashboard data: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={3}>
        {/* Metrics Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <DashboardMetrics metrics={metrics} />
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Performance Overview
            </Typography>
            <DashboardChart data={chartData} />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ 
              maxHeight: isMobileView ? 300 : 400, 
              overflow: 'auto' 
            }}>
              {recentActivity.map((activity) => (
                <DashboardCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  timestamp={activity.timestamp}
                  type={activity.type}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 