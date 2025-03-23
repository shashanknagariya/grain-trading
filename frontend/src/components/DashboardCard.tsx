import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

interface DashboardCardProps {
  title: string;
  description: string;
  timestamp: string;
  type: 'sale' | 'purchase' | 'user';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  timestamp,
  type
}) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {type}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 