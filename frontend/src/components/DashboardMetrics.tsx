import React from 'react';
import { Grid } from '@mui/material';
import { DashboardCard } from './DashboardCard';
import { useTranslation } from 'react-i18next';
import { DashboardMetrics as DashboardMetricsType } from '../hooks/useDashboardData';

interface DashboardMetricsProps {
  metrics: DashboardMetricsType;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <DashboardCard
          title={t('dashboard.total_sales')}
          value={metrics.totalSales}
          type="sale"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <DashboardCard
          title={t('dashboard.total_purchases')}
          value={metrics.totalPurchases}
          type="purchase"
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <DashboardCard
          title={t('dashboard.total_inventory')}
          value={metrics.inventory}
          type="user"
        />
      </Grid>
    </Grid>
  );
};