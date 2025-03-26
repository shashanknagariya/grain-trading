import React from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardCard } from '../components/DashboardCard';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { metrics, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>{t('common.noData')}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title={t('dashboard.totalPurchases')}
            value={formatCurrency(metrics.totalPurchases)}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title={t('dashboard.totalSales')}
            value={formatCurrency(metrics.totalSales)}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title={t('dashboard.totalInventory')}
            value={metrics.totalInventory.toLocaleString()}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title={t('dashboard.totalRevenue')}
            value={formatCurrency(metrics.totalRevenue)}
            color="#e91e63"
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recentPurchases')}
            </Typography>
            {metrics.recentPurchases.length === 0 ? (
              <Typography color="textSecondary">{t('common.noData')}</Typography>
            ) : (
              metrics.recentPurchases.map((purchase) => (
                <Box key={purchase.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {purchase.billNumber} - {purchase.supplierName}
                  </Typography>
                  <Typography color="textSecondary">
                    {formatCurrency(purchase.amount)} • {new Date(purchase.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.recentSales')}
            </Typography>
            {metrics.recentSales.length === 0 ? (
              <Typography color="textSecondary">{t('common.noData')}</Typography>
            ) : (
              metrics.recentSales.map((sale) => (
                <Box key={sale.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    {sale.billNumber} - {sale.buyerName}
                  </Typography>
                  <Typography color="textSecondary">
                    {formatCurrency(sale.amount)} • {new Date(sale.date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};