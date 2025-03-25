import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
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
  Chip,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Print as PrintIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { Purchase } from '../types/purchase';
import { formatCurrency } from '../utils/formatters';
import { PurchaseForm } from '../components/PurchaseForm';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../contexts/NotificationContext';
import { useReactToPrint } from 'react-to-print';
import { PurchaseDetails } from '../components/PurchaseDetails';
import { PurchaseBillPrint } from '../components/PurchaseBillPrint';

export const Purchases: FC = () => {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);
  
  // For the action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t('errors.fetch_error'));
      const data = await response.json();
      setPurchases(data);
      setLoading(false);
    } catch (error) {
      showError(t('errors.fetch_error'));
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `${t('purchases.title')}-${selectedPurchase?.id || t('purchases.bill')}`,
    onAfterPrint: () => console.log('Printed successfully')
  });

  const handlePaymentStatusChange = async (purchaseId: number, newStatus: 'pending' | 'paid' | 'partial') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/${purchaseId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error(t('errors.save_error'));
      
      setPurchases(purchases.map(purchase => 
        purchase.id === purchaseId 
          ? { ...purchase, payment_status: newStatus }
          : purchase
      ));

      if (selectedPurchase && selectedPurchase.id === purchaseId) {
        setSelectedPurchase({ ...selectedPurchase, payment_status: newStatus });
      }
      
      showError(t('purchases.status_updated'));
    } catch (error) {
      showError(t('errors.save_error'));
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

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, purchase: Purchase) => {
    setAnchorEl(event.currentTarget);
    setSelectedPurchase(purchase);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle view details
  const handleViewDetails = () => {
    if (selectedPurchase) {
      setDetailsOpen(true);
    }
    handleMenuClose();
  };

  // Handle print single purchase
  const handlePrintBill = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setTimeout(() => {
      handlePrint();
    }, 100);
    handleMenuClose();
  };

  // Handle print all purchases
  const handlePrintAll = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Purchases Report',
    pageStyle: `
      @media print {
        body {
          font-size: 12pt;
        }
        .MuiToolbar-root, .MuiButton-root, .no-print, .MuiIconButton-root {
          display: none !important;
        }
        .MuiPaper-root {
          box-shadow: none !important;
        }
        .MuiTableContainer-root {
          overflow: visible !important;
        }
      }
    `
  });

  if (loading) {
    return <Typography>{t('common.loading')}</Typography>;
  }

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
            onClick={handlePrintAll}
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
        <Box mb={3} className="no-print-header">
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Purchases Report
          </Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('purchases.purchase_date')}</TableCell>
                <TableCell>{t('purchases.seller_name')}</TableCell>
                <TableCell>{t('purchases.grain_name')}</TableCell>
                <TableCell>{t('purchases.total_amount')}</TableCell>
                <TableCell>{t('purchases.payment_status')}</TableCell>
                <TableCell className="no-print">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{purchase.seller_name}</TableCell>
                  <TableCell>{purchase.grain_name}</TableCell>
                  <TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`purchases.${purchase.payment_status}`)}
                      color={getStatusColor(purchase.payment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell className="no-print">
                    <IconButton
                      aria-label="more"
                      onClick={(e) => handleMenuOpen(e, purchase)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          {t('purchases.view_details')}
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedPurchase) handlePrintBill(selectedPurchase);
        }}>
          {t('common.print')}
        </MenuItem>
      </Menu>

      {/* Purchase Form */}
      <PurchaseForm
        open={openForm}
        onClose={handleCloseCreate}
        onSubmit={handlePurchaseCreated}
      />

      {/* Purchase Details Modal */}
      <PurchaseDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        purchase={selectedPurchase}
        onPrint={handlePrint}
        handlePaymentStatusChange={handlePaymentStatusChange}
      />

      {/* Hidden Print Template */}
      <div style={{ display: 'none' }}>
        {selectedPurchase && (
          <div ref={printComponentRef}>
            <PurchaseBillPrint purchase={selectedPurchase} />
          </div>
        )}
      </div>
    </Box>
  );
};