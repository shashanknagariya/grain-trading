import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../utils/formatters';
import { CardType } from '../types/dashboard';

export interface DashboardCardProps {
  title: string;
  value: number | null;
  type: CardType;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, type }) => {
  const formatValue = (value: number | null, type: CardType) => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
      case 'sale':
      case 'purchase':
      case 'user':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {formatValue(value, type)}
        </Typography>
      </CardContent>
    </Card>
  );
};