import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  useTheme,
  Divider
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  ArrowUpward as IncomingIcon,
  ArrowDownward as OutgoingIcon
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';

interface DashboardSummary {
  pending_incoming: number;
  pending_outgoing: number;
  inventory_value: number;
}

interface InventoryDetails {
  inventory: Array<{
    grain_name: string;
    number_of_bags: number;
    total_weight: number;
    rate_per_kg: number;
    value: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [inventoryDetails, setInventoryDetails] = useState<InventoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, inventoryResponse] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/summary', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('http://localhost:5000/api/inventory/summary', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        if (!summaryResponse.ok || !inventoryResponse.ok) 
          throw new Error('Failed to fetch data');

        const summaryData = await summaryResponse.json();
        const inventoryData = await inventoryResponse.json();
        
        setSummary(summaryData);
        setInventoryDetails(inventoryData);
      } catch (error) {
        showError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    {
      title: 'Pending Incoming',
      value: summary?.pending_incoming || 0,
      icon: <IncomingIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      color: theme.palette.success.main,
      description: 'Total pending payments to receive'
    },
    {
      title: 'Pending Outgoing',
      value: summary?.pending_outgoing || 0,
      icon: <OutgoingIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />,
      color: theme.palette.error.main,
      description: 'Total pending payments to make'
    },
    {
      title: 'Current Inventory Value',
      value: summary?.inventory_value || 0,
      icon: <BalanceIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      description: 'Total value of current stock'
    }
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Dashboard</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${card.color}08 0%, ${card.color}03 100%)`,
                border: `1px solid ${card.color}20`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 4px 20px ${card.color}20`
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                      {formatCurrency(card.value)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {card.description}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Inventory Details Section */}
      {inventoryDetails?.inventory && inventoryDetails.inventory.length > 0 && (
        <Box mt={4}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Inventory Details</Typography>
          <Grid container spacing={2}>
            {inventoryDetails.inventory.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{item.grain_name}</Typography>
                    <Typography>Bags: {item.number_of_bags}</Typography>
                    <Typography>Weight: {item.total_weight} kg</Typography>
                    <Typography>Rate: {formatCurrency(item.rate_per_kg)}/kg</Typography>
                    <Typography>Value: {formatCurrency(item.value)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}; 