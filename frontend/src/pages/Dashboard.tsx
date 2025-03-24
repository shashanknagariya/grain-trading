import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardCard } from '../components/DashboardCard';
import { DashboardChart } from '../components/DashboardChart';
import { useTranslation } from 'react-i18next';
import { DashboardMetrics, DashboardChartData } from '../types/dashboard';

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
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Metrics Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.metrics.title')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <DashboardCard
                  title={t('dashboard.metrics.totalRevenue')}
                  value={metrics.totalRevenue}
                  type="currency"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DashboardCard
                  title={t('dashboard.metrics.totalExpenses')}
                  value={metrics.totalExpenses}
                  type="currency"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DashboardCard
                  title={t('dashboard.metrics.netProfit')}
                  value={metrics.netProfit}
                  type="currency"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DashboardCard
                  title={t('dashboard.metrics.pendingPayments')}
                  value={metrics.pendingPayments}
                  type="currency"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DashboardCard
                  title={t('dashboard.metrics.activeGrains')}
                  value={metrics.activeGrains}
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DashboardCard
                  title={t('dashboard.metrics.totalGodowns')}
                  value={metrics.totalGodowns}
                  type="number"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Monthly Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.chart.title')}
            </Typography>
            <DashboardChart 
              data={chartData} 
              labels={{
                sales: t('dashboard.chart.sales'),
                purchases: t('dashboard.chart.purchases'),
                profit: t('dashboard.chart.profit')
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};