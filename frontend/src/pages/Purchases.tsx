import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Purchase } from '../types/purchase';
import { fetchPurchases } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const data = await fetchPurchases();
        setPurchases(data);
      } catch (error) {
        console.error('Error loading purchases:', error);
      }
    };

    loadPurchases();
  }, []);

  const handleView = (id: number) => {
    navigate(`/purchases/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/purchases/${id}/edit`);
  };

  const handleCreatePurchase = () => {
    navigate('/purchases/create');
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Purchases</Typography>
        {user?.permissions.includes('make:purchase') && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePurchase}
          >
            Create Purchase
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Bill Number</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Grain</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{formatDate(new Date(purchase.purchase_date))}</TableCell>
                <TableCell>{purchase.bill_number}</TableCell>
                <TableCell>{purchase.supplier_name}</TableCell>
                <TableCell>{purchase.grain?.name}</TableCell>
                <TableCell align="right">
                  {formatCurrency(purchase.total_amount)}
                </TableCell>
                <TableCell>{purchase.payment_status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(purchase.id)}>
                    <ViewIcon />
                  </IconButton>
                  {user?.permissions.includes('make:purchase') && (
                    <IconButton onClick={() => handleEdit(purchase.id)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};