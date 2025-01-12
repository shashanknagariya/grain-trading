import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Purchase } from '../types/purchase';
import { formatCurrency } from '../utils/formatters';
import { PermissionGuard } from '../components/PermissionGuard';
import { Permissions } from '../constants/permissions';
import { PurchaseForm } from '../components/PurchaseForm';

export const Purchases: FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/purchases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch purchases');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partially_paid':
        return 'warning';
      default:
        return 'error';
    }
  };

  const handleRowClick = (purchaseId: number) => {
    navigate(`/purchases/${purchaseId}`);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Purchases</Typography>
        <PermissionGuard permission={Permissions.MAKE_PURCHASE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            New Purchase
          </Button>
        </PermissionGuard>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bill Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow 
                key={purchase.id}
                onClick={() => handleRowClick(purchase.id)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>{purchase.bill_number}</TableCell>
                <TableCell>{new Date(purchase.purchase_date).toLocaleDateString()}</TableCell>
                <TableCell>{purchase.supplier_name}</TableCell>
                <TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
                <TableCell>
                  <Chip 
                    label={purchase.payment_status.replace('_', ' ')}
                    color={getStatusColor(purchase.payment_status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PurchaseForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={fetchPurchases}
      />
    </Box>
  );
}; 