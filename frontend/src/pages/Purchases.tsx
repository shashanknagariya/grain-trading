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
import { MoreVert as MoreVertIcon, Print as PrintIcon, Edit as EditIcon, Delete as DeleteIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Purchase } from '../types/purchase';
import { fetchPurchases, deletePurchase, createPurchase } from '../services/api';
import { PurchaseBillPrint } from '../components/PurchaseBillPrint';
import { useTranslation } from 'react-i18next';
import { EditPurchaseModal } from '../components/EditPurchaseModal';
import { TextFilter, DateFilter, NumberFilter, SelectFilter } from '../components/filters';
import { useReactToPrint } from 'react-to-print';
import { PurchaseForm } from '../components/PurchaseForm';
import { useNotification } from '../contexts/NotificationContext';

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
  paymentStatus: ''
};

export const Purchases: React.FC = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PurchaseFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const printComponentRef = useRef(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await fetchPurchases();
      setPurchases(data);
    } catch (error) {
      showError(t('purchases.errors.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
  });

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    handleCloseMenu();
  };

  const handlePrintBill = () => {
    setShowPrintModal(true);
    handleCloseMenu();
  };

  const handleDelete = async () => {
    if (!selectedPurchase) return;

    try {
      await deletePurchase(selectedPurchase.id);
      showSuccess(t('purchases.delete_success'));
      loadPurchases();
    } catch (error) {
      showError(t('purchases.errors.delete_error'));
    }
    handleCloseMenu();
  };

  const handleCreatePurchase = async (data: any) => {
    try {
      await createPurchase(data);
      showSuccess(t('purchases.create_success'));
      loadPurchases();
      setShowCreateModal(false);
    } catch (error) {
      showError(t('purchases.errors.create_error'));
    }
  };

  const handleFilterChange = (field: keyof PurchaseFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredPurchases = purchases.filter(purchase => {
    if (filters.billNumber && !purchase.bill_number.toLowerCase().includes(filters.billNumber.toLowerCase())) return false;
    if (filters.sellerName && !purchase.supplier_name.toLowerCase().includes(filters.sellerName.toLowerCase())) return false;
    if (filters.grainName && !purchase.grain_name.toLowerCase().includes(filters.grainName.toLowerCase())) return false;
    if (filters.startDate && new Date(purchase.purchase_date) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(purchase.purchase_date) > new Date(filters.endDate)) return false;
    if (filters.minAmount && purchase.total_amount < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && purchase.total_amount > parseFloat(filters.maxAmount)) return false;
    if (filters.paymentStatus && purchase.payment_status !== filters.paymentStatus) return false;
    return true;
  });

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{t('purchases.title')}</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowCreateModal(true)}
            sx={{ mr: 2 }}
          >
            {t('purchases.add_purchase')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {t('common.filters')}
          </Button>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextFilter
                label={t('purchases.bill_number')}
                value={filters.billNumber}
                onChange={(value) => handleFilterChange('billNumber', value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextFilter
                label={t('purchases.supplier_name')}
                value={filters.sellerName}
                onChange={(value) => handleFilterChange('sellerName', value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextFilter
                label={t('purchases.grain_name')}
                value={filters.grainName}
                onChange={(value) => handleFilterChange('grainName', value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SelectFilter
                label={t('common.payment_status')}
                value={filters.paymentStatus}
                onChange={(value) => handleFilterChange('paymentStatus', value)}
                options={[
                  { value: '', label: t('common.all') },
                  { value: 'pending', label: t('common.payment_status.pending') },
                  { value: 'partial', label: t('common.payment_status.partial') },
                  { value: 'paid', label: t('common.payment_status.paid') }
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DateFilter
                startDate={filters.startDate}
                endDate={filters.endDate}
                onStartDateChange={(value) => handleFilterChange('startDate', value)}
                onEndDateChange={(value) => handleFilterChange('endDate', value)}
                startLabel={t('purchases.start_date')}
                endLabel={t('purchases.end_date')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <NumberFilter
                minValue={filters.minAmount}
                maxValue={filters.maxAmount}
                onMinValueChange={(value) => handleFilterChange('minAmount', value)}
                onMaxValueChange={(value) => handleFilterChange('maxAmount', value)}
                minLabel={t('purchases.min_amount')}
                maxLabel={t('purchases.max_amount')}
              />
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('purchases.bill_number')}</TableCell>
                <TableCell>{t('purchases.supplier_name')}</TableCell>
                <TableCell>{t('purchases.grain_name')}</TableCell>
                <TableCell align="right">{t('purchases.number_of_bags')}</TableCell>
                <TableCell align="right">{t('purchases.total_weight')}</TableCell>
                <TableCell align="right">{t('purchases.total_amount')}</TableCell>
                <TableCell>{t('common.payment_status')}</TableCell>
                <TableCell>{t('purchases.purchase_date')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.bill_number}</TableCell>
                  <TableCell>{purchase.supplier_name}</TableCell>
                  <TableCell>{purchase.grain_name}</TableCell>
                  <TableCell align="right">{purchase.number_of_bags}</TableCell>
                  <TableCell align="right">{purchase.total_weight}</TableCell>
                  <TableCell align="right">{formatCurrency(purchase.total_amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`common.payment_status.${purchase.payment_status}`)}
                      color={
                        purchase.payment_status === 'paid'
                          ? 'success'
                          : purchase.payment_status === 'partial'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{purchase.purchase_date ? formatDate(new Date(purchase.purchase_date)) : ''}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleOpenMenu(e, purchase)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handlePrintBill}>
          <PrintIcon sx={{ mr: 1 }} />
          {t('common.print')}
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {selectedPurchase && (
        <>
          <EditPurchaseModal
            open={showEditModal}
            purchase={selectedPurchase}
            onClose={() => setShowEditModal(false)}
            onUpdate={() => {
              setShowEditModal(false);
              loadPurchases();
            }}
          />

          <Dialog open={showPrintModal} onClose={() => setShowPrintModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>{t('purchases.print_bill')}</DialogTitle>
            <DialogContent>
              <div ref={printComponentRef}>
                <PurchaseBillPrint purchase={selectedPurchase} />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPrintModal(false)}>{t('common.close')}</Button>
              <Button onClick={handlePrint} variant="contained" color="primary">
                {t('common.print')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      <PurchaseForm
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePurchase}
      />
    </Box>
  );
};