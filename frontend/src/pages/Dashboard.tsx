import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardCard } from '../components/DashboardCard';
import { DashboardChart } from '../components/DashboardChart';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { useTranslation } from 'react-i18next';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { 
    metrics, 
    chartData, 
    isLoading,
    error 
  } = useDashboardData();

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>{t('common.loading')}</Typography>
        <LoadingSkeleton variant="card" count={3} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          {t('errors.server_error')}: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">
          {t('errors.fetch_error')}
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
            <Typography variant="h4" gutterBottom>
              {t('dashboard.title')}
            </Typography>
            <DashboardMetrics metrics={metrics} />
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.inventory_status')}
            </Typography>
            <DashboardChart data={chartData} />
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.recent_sales')}
              </Typography>
              <DashboardCard
                title={t('dashboard.total_sales')}
                value={metrics.totalSales}
                type="sale"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.recent_purchases')}
              </Typography>
              <DashboardCard
                title={t('dashboard.total_purchases')}
                value={metrics.totalPurchases}
                type="purchase"
              />
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.payment_pending')}
              </Typography>
              <DashboardCard
                title={t('dashboard.total_inventory')}
                value={metrics.inventory}
                type="sale"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};