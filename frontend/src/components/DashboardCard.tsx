import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../utils/formatters';

export interface DashboardCardProps {
  title: string;
  value: number;
  type: 'sale' | 'purchase' | 'user';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, type }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {type === 'sale' || type === 'purchase' ? formatCurrency(value) : value}
        </Typography>
      </CardContent>
    </Card>
  );
};