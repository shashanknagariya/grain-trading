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
  
  // For the action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

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

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, purchase: Purchase) => {
    setAnchorEl(event.currentTarget);
    setSelectedPurchase(purchase);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPurchase(null);
  };

  // Handle view details
  const handleViewDetails = () => {
    if (selectedPurchase) {
      navigate(`/purchases/${selectedPurchase.id}`);
    }
    handleMenuClose();
  };

  // Handle print single purchase
  const handlePrintSingle = useReactToPrint({
    content: () => {
      // Create a temporary div for printing
      const printContent = document.createElement('div');
      
      if (selectedPurchase) {
        // Create purchase receipt content
        printContent.innerHTML = `
          <div style="padding: 20px;">
            <h2 style="text-align: center;">Purchase Receipt</h2>
            <p style="text-align: center;">Bill Number: ${selectedPurchase.bill_number || ''}</p>
            <hr />
            <p><strong>Date:</strong> ${new Date(selectedPurchase.purchase_date).toLocaleDateString()}</p>
            <p><strong>Supplier:</strong> ${selectedPurchase.supplier_name}</p>
            <p><strong>Grain:</strong> ${selectedPurchase.grain_name}</p>
            <p><strong>Amount:</strong> ${formatCurrency(selectedPurchase.total_amount)}</p>
            <p><strong>Status:</strong> ${selectedPurchase.payment_status}</p>
          </div>
        `;
      }
      
      return printContent;
    },
    documentTitle: selectedPurchase ? `Purchase-${selectedPurchase.bill_number || ''}` : 'Purchase',
    onAfterPrint: handleMenuClose
  });

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
        <MenuItem onClick={handlePrintSingle}>
          {t('common.print')}
        </MenuItem>
      </Menu>

      <PurchaseForm
        open={openForm}
        onClose={handleCloseCreate}
        onSubmit={handlePurchaseCreated}
      />
    </Box>
  );
};