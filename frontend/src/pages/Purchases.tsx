import React, { useState, useEffect, useRef } from 'react';
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
import { Add as AddIcon, Print as PrintIcon } from '@mui/icons-material';
import { Purchase } from '../types/purchase';
import { formatCurrency } from '../utils/formatters';
import { PermissionGuard } from '../components/PermissionGuard';
import { Permissions } from '../constants/permissions';
import { PurchaseForm } from '../components/PurchaseForm';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../contexts/NotificationContext';
import { useReactToPrint } from 'react-to-print';

export const Purchases: FC = () => {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t('errors.fetch_error'));
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      showError(t('errors.fetch_error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'error';
      case 'partial':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handlePurchaseCreated = () => {
    setOpenForm(false);
    fetchPurchases();
  };

  const handleOpenCreate = () => {
    setOpenForm(true);
  };

  const handleCloseCreate = () => {
    setOpenForm(false);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Purchases Report',
  });

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('purchases.title')}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ mr: 2 }}
          >
            {t('common.print')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            {t('purchases.add_purchase')}
          </Button>
        </Box>
      </Box>

      <div ref={printRef}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('purchases.purchase_date')}</TableCell>
                <TableCell>{t('purchases.seller_name')}</TableCell>
                <TableCell>{t('purchases.grain_name')}</TableCell>
                <TableCell>{t('purchases.total_amount')}</TableCell>
                <TableCell>{t('purchases.payment_status')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{purchase.supplier_name}</TableCell>
                  <TableCell>{purchase.grain_name}</TableCell>
                  <TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`purchases.${purchase.payment_status}`)}
                      color={getStatusColor(purchase.payment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/purchases/${purchase.id}`)}
                    >
                      {t('purchases.view_details')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <PurchaseForm
        open={openForm}
        onClose={handleCloseCreate}
        onSubmit={handlePurchaseCreated}
      />
    </Box>
  );
};