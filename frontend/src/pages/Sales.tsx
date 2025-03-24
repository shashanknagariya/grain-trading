import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { SalesForm } from '../components/SalesForm';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate, formatCurrency } from '../utils/formatters';
import { SaleDetails } from '../components/SaleDetails';
import { SaleBillPrint } from '../components/SaleBillPrint';
import { useReactToPrint } from 'react-to-print';
import { Sale } from '../types/sale';
import { useTranslation } from 'react-i18next';

export const Sales: React.FC = () => {
  const { t } = useTranslation();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const { showError } = useNotification();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const printComponentRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `${t('sales.title')}-${selectedSale?.bill_number || t('sales.bill')}`,
    onAfterPrint: () => console.log('Printed successfully')
  });

  const handlePaymentStatusChange = async (saleId: number, newStatus: 'pending' | 'paid' | 'partial') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales/${saleId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error(t('errors.save_error'));
      
      setSales(sales.map(sale => 
        sale.id === saleId 
          ? { ...sale, payment_status: newStatus }
          : sale
      ));

      if (selectedSale && selectedSale.id === saleId) {
        setSelectedSale({ ...selectedSale, payment_status: newStatus });
      }
      
      showError(t('sales.status_updated'));
    } catch (error) {
      showError(t('errors.save_error'));
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t('errors.fetch_error'));
      const data = await response.json();
      setSales(data);
      setLoading(false);
    } catch (error) {
      showError(t('errors.fetch_error'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, saleId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedSaleId(saleId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedSaleId(null);
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
    handleCloseMenu();
  };

  const handlePrintBill = (sale: Sale) => {
    setSelectedSale(sale);
    setTimeout(() => {
      handlePrint();
    }, 100);
    handleCloseMenu();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return t('sales.paid');
      case 'pending':
        return t('sales.pending');
      case 'partial':
        return t('sales.partial');
      default:
        return status;
    }
  };

  if (loading) {
    return <Typography>{t('common.loading')}</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1">
          {t('sales.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          {t('sales.add_sale')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('sales.bill_number')}</TableCell>
              <TableCell>{t('sales.customer_name')}</TableCell>
              <TableCell>{t('sales.sale_date')}</TableCell>
              <TableCell>{t('sales.total_amount')}</TableCell>
              <TableCell>{t('sales.payment_status')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.bill_number}</TableCell>
                <TableCell>{sale.customer_name || sale.buyer_name}</TableCell>
                <TableCell>{formatDate(new Date(sale.sale_date))}</TableCell>
                <TableCell>{formatCurrency(sale.total_amount)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(sale.payment_status)}
                    color={getStatusColor(sale.payment_status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleOpenMenu(e, sale.id)}
                    size="small"
                  >
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
        <MenuItem
          onClick={() => {
            const sale = sales.find(s => s.id === selectedSaleId);
            if (sale) handleViewDetails(sale);
          }}
        >
          {t('sales.view_details')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const sale = sales.find(s => s.id === selectedSaleId);
            if (sale) handlePrintBill(sale);
          }}
        >
          {t('sales.print_bill')}
        </MenuItem>
      </Menu>

      <SalesForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={() => {
          setOpenForm(false);
          fetchSales();
        }}
      />

      <SaleDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        sale={selectedSale}
        onPrint={handlePrint}
        handlePaymentStatusChange={handlePaymentStatusChange}
      />

      <div style={{ display: 'none' }}>
        {selectedSale && (
          <div ref={printComponentRef}>
            <SaleBillPrint sale={selectedSale} />
          </div>
        )}
      </div>
    </Box>
  );
};