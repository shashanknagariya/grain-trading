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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Collapse,
  Grid,
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon, Print as PrintIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { SalesForm } from '../components/SalesForm';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate, formatCurrency } from '../utils/formatters';
import { SaleDetails } from '../components/SaleDetails';
import { SaleBillPrint } from '../components/SaleBillPrint';
import { useReactToPrint } from 'react-to-print';
import { Sale } from '../types/sale';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getSales as fetchSales, deleteSale } from '../services/api';
import { useSnackbar } from 'notistack';
import { EditSaleModal } from '../components/EditSaleModal';
import { TextFilter, DateFilter, NumberFilter, SelectFilter } from '../components/filters';

interface SaleFilters {
  billNumber: string;
  customerName: string;
  grainName: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  paymentStatus: string;
}

const initialFilters: SaleFilters = {
  billNumber: '',
  customerName: '',
  grainName: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  paymentStatus: '',
};

export const Sales: React.FC = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { showError } = useNotification();
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const printComponentRef = useRef<HTMLDivElement>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<SaleFilters>(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error(t('errors.fetch_error'));
        const data = await response.json();
        setSales(data);
      } catch (error) {
        console.error('Error fetching sales:', error);
        enqueueSnackbar(t('errors.fetch_error'), { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, sale: Sale) => {
    setAnchorEl(event.currentTarget);
    setSelectedSaleId(sale.id);
    setSelectedSale(sale);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedSaleId(null);
  };

  const handleMenuAction = (action: 'print' | 'details' | 'edit' | 'delete') => {
    if (!selectedSaleId) return;

    if (action === 'print') {
      handlePrint();
    } else if (action === 'details') {
      handleViewDetails(selectedSale!);
    } else if (action === 'edit') {
      handleEditClick(selectedSale!);
    } else if (action === 'delete') {
      handleDeleteClick(selectedSale!);
    }
    handleCloseMenu();
  };

  const handleCreateClick = () => {
    setOpenForm(true);
  };

  const handleEditClick = (sale: Sale) => {
    setSelectedSale(sale);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (sale: Sale) => {
    setSelectedSale(sale);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSale) return;

    try {
      setDeleteLoading(true);
      await deleteSale(selectedSale.id);
      setSales(sales.filter(sale => sale.id !== selectedSale.id));
      enqueueSnackbar(t('sales.delete_success'), { variant: 'success' });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      enqueueSnackbar(error.message || t('common.error'), { variant: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setDetailsOpen(true);
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

  const handleFilterChange = (key: keyof SaleFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const filteredSales = React.useMemo(() => {
    return sales.filter((sale) => {
      const matchBillNumber = sale.bill_number.toLowerCase().includes(filters.billNumber.toLowerCase());
      const matchCustomerName = sale.customer_name.toLowerCase().includes(filters.customerName.toLowerCase());
      const matchGrainName = !filters.grainName || sale.grain_name === filters.grainName;
      
      const saleDate = new Date(sale.sale_date);
      const matchStartDate = !filters.startDate || saleDate >= new Date(filters.startDate);
      const matchEndDate = !filters.endDate || saleDate <= new Date(filters.endDate);
      
      const matchMinAmount = !filters.minAmount || sale.total_amount >= parseFloat(filters.minAmount);
      const matchMaxAmount = !filters.maxAmount || sale.total_amount <= parseFloat(filters.maxAmount);
      const matchPaymentStatus = !filters.paymentStatus || sale.payment_status === filters.paymentStatus;

      return (
        matchBillNumber &&
        matchCustomerName &&
        matchGrainName &&
        matchStartDate &&
        matchEndDate &&
        matchMinAmount &&
        matchMaxAmount &&
        matchPaymentStatus
      );
    });
  }, [sales, filters]);

  const uniqueGrains = React.useMemo(() => {
    const grains = new Set(sales.map((s) => s.grain_name));
    return Array.from(grains).filter(Boolean).map((grain) => ({
      value: grain as string,
      label: grain as string,
    }));
  }, [sales]);

  const paymentStatusOptions = [
    { value: 'paid', label: t('common.payment_status.paid') },
    { value: 'pending', label: t('common.payment_status.pending') },
    { value: 'partial', label: t('common.payment_status.partial') },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1">
          {t('sales.title')}
        </Typography>
        <Box>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            variant={isFiltersOpen ? 'contained' : 'outlined'}
            sx={{ mr: 1 }}
          >
            {t('common.filters.title')}
          </Button>
          {user?.permissions.includes('make:sale') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              {t('sales.add_sale')}
            </Button>
          )}
        </Box>
      </Box>

      <Collapse in={isFiltersOpen}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextFilter
                value={filters.billNumber}
                onChange={(value) => handleFilterChange('billNumber', value)}
                label={t('sales.filters.bill_number')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextFilter
                value={filters.customerName}
                onChange={(value) => handleFilterChange('customerName', value)}
                label={t('sales.filters.customer_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SelectFilter
                value={filters.grainName}
                onChange={(value) => handleFilterChange('grainName', value)}
                options={uniqueGrains}
                label={t('sales.filters.grain_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DateFilter
                startDate={filters.startDate}
                endDate={filters.endDate}
                onStartDateChange={(value) => handleFilterChange('startDate', value)}
                onEndDateChange={(value) => handleFilterChange('endDate', value)}
                startLabel={t('sales.filters.date_range')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <NumberFilter
                minValue={filters.minAmount}
                maxValue={filters.maxAmount}
                onMinValueChange={(value) => handleFilterChange('minAmount', value)}
                onMaxValueChange={(value) => handleFilterChange('maxAmount', value)}
                minLabel={t('sales.filters.amount_range')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SelectFilter
                value={filters.paymentStatus}
                onChange={(value) => handleFilterChange('paymentStatus', value)}
                options={paymentStatusOptions}
                label={t('sales.filters.payment_status')}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button onClick={handleResetFilters}>
                  {t('common.filters.reset')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

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
            {filteredSales.map((sale) => (
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
                  <IconButton onClick={(e) => handleOpenMenu(e, sale)}>
                    <MoreVertIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEditClick(sale)}
                    color="primary"
                    title={t('common.edit')}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(sale)}
                    color="error"
                    title={t('common.delete')}
                  >
                    <DeleteIcon />
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
          {t('common.print')}
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('details')}>
          <ViewIcon sx={{ mr: 1 }} />
          {t('sales.view_details')}
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('delete')}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
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

      <EditSaleModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        sale={selectedSale}
        onUpdate={() => setSales(sales.map(sale => sale.id === selectedSale?.id ? selectedSale : sale))}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('sales.delete_confirmation_title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('sales.delete_confirmation_message', {
              billNumber: selectedSale?.bill_number,
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <CircularProgress size={24} />
            ) : (
              t('common.delete')
            )}
          </Button>
        </DialogActions>
      </Dialog>

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