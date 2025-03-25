import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MoreVert as MoreVertIcon, Print as PrintIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Purchase } from '../types/purchase';
import { fetchPurchases } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PurchaseBillPrint } from '../components/PurchaseBillPrint';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';

export const Purchases = () => {
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `${t('purchases.title')}-${selectedPurchase?.bill_number || ''}`,
    onAfterPrint: () => console.log('Printed successfully')
  });

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

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, purchase: Purchase) => {
    setAnchorEl(event.currentTarget);
    setSelectedPurchaseId(purchase.id);
    setSelectedPurchase(purchase);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedPurchaseId(null);
  };

  const handleMenuAction = (action: 'print' | 'details') => {
    if (!selectedPurchaseId) return;

    if (action === 'print') {
      handlePrint();
    } else {
      navigate(`/purchases/${selectedPurchaseId}`);
    }
    handleCloseMenu();
  };

  const handleCreatePurchase = () => {
    navigate('/purchases/create');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('purchases.title')}</Typography>
        {user?.permissions.includes('make:purchase') && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePurchase}
          >
            {t('purchases.add_purchase')}
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('purchases.purchase_date')}</TableCell>
              <TableCell>{t('purchases.bill_number')}</TableCell>
              <TableCell>{t('purchases.seller_name')}</TableCell>
              <TableCell>{t('purchases.grain_name')}</TableCell>
              <TableCell align="right">{t('purchases.total_amount')}</TableCell>
              <TableCell>{t('purchases.payment_status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{formatDate(new Date(purchase.purchase_date))}</TableCell>
                <TableCell>{purchase.bill_number}</TableCell>
                <TableCell>{purchase.supplier_name}</TableCell>
                <TableCell>{purchase.grain?.name || t('common.noData')}</TableCell>
                <TableCell align="right">
                  {formatCurrency(purchase.total_amount)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(`purchases.${purchase.payment_status}`)}
                    color={getPaymentStatusColor(purchase.payment_status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleOpenMenu(e, purchase)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleMenuAction('print')}>
          <PrintIcon sx={{ mr: 1 }} />
          {t('purchases.print_bill')}
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('details')}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('purchases.view_details')}
        </MenuItem>
      </Menu>

      {/* Hidden print component */}
      <div style={{ display: 'none' }}>
        <div ref={printComponentRef}>
          {selectedPurchase && <PurchaseBillPrint purchase={selectedPurchase} />}
        </div>
      </div>
    </Box>
  );
};