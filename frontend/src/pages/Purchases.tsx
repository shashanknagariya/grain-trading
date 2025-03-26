import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Typography,
  Box,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Collapse,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MoreVert as MoreVertIcon, Print as PrintIcon, Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Purchase } from '../types/purchase';
import { fetchPurchases, deletePurchase } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PurchaseBillPrint } from '../components/PurchaseBillPrint';
import { useTranslation } from 'react-i18next';
import { EditPurchaseModal } from '../components/EditPurchaseModal';
import { TextFilter, DateFilter, NumberFilter, SelectFilter } from '../components/filters';
import { useReactToPrint } from 'react-to-print';

interface PurchaseFilters {
  billNumber: string;
  sellerName: string;
  grainName: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  paymentStatus: string;
}

const initialFilters: PurchaseFilters = {
  billNumber: '',
  sellerName: '',
  grainName: '',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  paymentStatus: '',
};

export const Purchases: React.FC = () => {
  const { t } = useTranslation();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<PurchaseFilters>(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, purchase: Purchase) => {
    setAnchorEl(event.currentTarget);
    setSelectedPurchase(purchase);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedPurchase(null);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedPurchase(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPurchase) {
      setDeleteLoading(true);
      try {
        await deletePurchase(selectedPurchase.id);
        setPurchases((prevPurchases) => prevPurchases.filter((purchase) => purchase.id !== selectedPurchase.id));
        handleDeleteDialogClose();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        setError(t('errors.delete_error'));
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleFilterChange = (key: keyof PurchaseFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  const handleUpdatePurchase = (updatedPurchase: Purchase) => {
    setPurchases((prevPurchases) =>
      prevPurchases.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p))
    );
    handleEditModalClose();
  };

  const filteredPurchases = React.useMemo(() => {
    return purchases.filter((purchase) => {
      const matchBillNumber = purchase.bill_number.toLowerCase().includes(filters.billNumber.toLowerCase());
      const matchSellerName = purchase.supplier_name.toLowerCase().includes(filters.sellerName.toLowerCase());
      const matchGrainName = !filters.grainName || purchase.grain?.name === filters.grainName;
      
      const purchaseDate = new Date(purchase.purchase_date);
      const matchStartDate = !filters.startDate || purchaseDate >= new Date(filters.startDate);
      const matchEndDate = !filters.endDate || purchaseDate <= new Date(filters.endDate);
      
      const matchMinAmount = !filters.minAmount || purchase.total_amount >= parseFloat(filters.minAmount);
      const matchMaxAmount = !filters.maxAmount || purchase.total_amount <= parseFloat(filters.maxAmount);
      const matchPaymentStatus = !filters.paymentStatus || purchase.payment_status === filters.paymentStatus;

      return (
        matchBillNumber &&
        matchSellerName &&
        matchGrainName &&
        matchStartDate &&
        matchEndDate &&
        matchMinAmount &&
        matchMaxAmount &&
        matchPaymentStatus
      );
    });
  }, [purchases, filters]);

  const uniqueGrains = React.useMemo(() => {
    const grains = new Set(purchases.map((p) => p.grain?.name));
    return Array.from(grains).filter(Boolean).map((grain) => ({
      value: grain as string,
      label: grain as string,
    }));
  }, [purchases]);

  const paymentStatusOptions = [
    { value: 'paid', label: t('common.payment_status.paid') },
    { value: 'pending', label: t('common.payment_status.pending') },
    { value: 'partial', label: t('common.payment_status.partial') },
  ];

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const data = await fetchPurchases();
        setPurchases(data);
      } catch (error) {
        console.error('Error loading purchases:', error);
        setError(t('errors.load_error'));
      } finally {
        setLoading(false);
      }
    };
    loadPurchases();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">{t('purchases.title')}</Typography>
        <Box>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            variant={isFiltersOpen ? 'contained' : 'outlined'}
            sx={{ mr: 1 }}
          >
            {t('common.filters.title')}
          </Button>
          {user?.permissions.includes('make:purchase') && (
            <Button
              variant="contained"
              onClick={() => navigate('/purchases/create')}
            >
              {t('purchases.add_purchase')}
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
                label={t('purchases.filters.bill_number')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextFilter
                value={filters.sellerName}
                onChange={(value) => handleFilterChange('sellerName', value)}
                label={t('purchases.filters.seller_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SelectFilter
                value={filters.grainName}
                onChange={(value) => handleFilterChange('grainName', value)}
                options={uniqueGrains}
                label={t('purchases.filters.grain_name')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DateFilter
                startDate={filters.startDate}
                endDate={filters.endDate}
                onStartDateChange={(value) => handleFilterChange('startDate', value)}
                onEndDateChange={(value) => handleFilterChange('endDate', value)}
                startLabel={t('purchases.filters.date_range')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <NumberFilter
                minValue={filters.minAmount}
                maxValue={filters.maxAmount}
                onMinValueChange={(value) => handleFilterChange('minAmount', value)}
                onMaxValueChange={(value) => handleFilterChange('maxAmount', value)}
                minLabel={t('purchases.filters.amount_range')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <SelectFilter
                value={filters.paymentStatus}
                onChange={(value) => handleFilterChange('paymentStatus', value)}
                options={paymentStatusOptions}
                label={t('purchases.filters.payment_status')}
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
              <TableCell>{t('purchases.bill_number')}</TableCell>
              <TableCell>{t('purchases.purchase_date')}</TableCell>
              <TableCell>{t('purchases.seller_name')}</TableCell>
              <TableCell>{t('purchases.grain_name')}</TableCell>
              <TableCell align="right">{t('purchases.number_of_bags')}</TableCell>
              <TableCell align="right">{t('purchases.total_weight')}</TableCell>
              <TableCell align="right">{t('purchases.total_amount')}</TableCell>
              <TableCell>{t('purchases.payment_status')}</TableCell>
              <TableCell align="center">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.bill_number}</TableCell>
                  <TableCell>{formatDate(new Date(purchase.purchase_date))}</TableCell>
                  <TableCell>{purchase.supplier_name}</TableCell>
                  <TableCell>{purchase.grain?.name}</TableCell>
                  <TableCell align="right">{purchase.number_of_bags.toLocaleString()}</TableCell>
                  <TableCell align="right">{purchase.total_weight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg</TableCell>
                  <TableCell align="right">{formatCurrency(purchase.total_amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`common.payment_status.${purchase.payment_status}`)}
                      color={purchase.payment_status === 'paid' ? 'success' : purchase.payment_status === 'partial' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label="actions"
                      size="small"
                      onClick={(event) => handleMenuOpen(event, purchase)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          {t('common.delete')}
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); handlePrint(); }}>
          <PrintIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.print')}
        </MenuItem>
      </Menu>

      {selectedPurchase && (
        <>
          <EditPurchaseModal
            open={isEditModalOpen}
            onClose={handleEditModalClose}
            purchase={selectedPurchase}
            onUpdate={handleUpdatePurchase}
          />
          <Dialog open={isDeleteDialogOpen} onClose={handleDeleteDialogClose}>
            <DialogTitle>{t('purchases.delete_confirmation_title')}</DialogTitle>
            <DialogContent>
              {t('purchases.delete_confirmation_message', {
                billNumber: selectedPurchase.bill_number,
              })}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteDialogClose}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                color="error"
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
        </>
      )}

      <div style={{ display: 'none' }}>
        <div ref={printComponentRef}>
          {selectedPurchase && <PurchaseBillPrint purchase={selectedPurchase} />}
        </div>
      </div>
    </Box>
  );
};