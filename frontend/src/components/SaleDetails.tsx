import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { Print as PrintIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Sale } from '../types/sale';
import { useTranslation } from 'react-i18next';

interface SaleDetailsProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
  onPrint: () => void;
  handlePaymentStatusChange: (saleId: number, newStatus: 'pending' | 'paid' | 'partial') => void;
}

export const SaleDetails: React.FC<SaleDetailsProps> = ({ open, onClose, sale, onPrint, handlePaymentStatusChange }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: 'pending' | 'paid' | 'partial') => {
    if (sale) {
      await handlePaymentStatusChange(sale.id, newStatus);
      handleStatusMenuClose();
    }
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

  if (!sale) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('sales.sale_details')}</Typography>
          <Box>
            <IconButton onClick={onPrint} size="small">
              <PrintIcon />
            </IconButton>
            <IconButton onClick={handleStatusMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('sales.bill_number')}
              </Typography>
              <Typography variant="body1">{sale.bill_number}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('sales.customer_name')}
              </Typography>
              <Typography variant="body1">{sale.customer_name || sale.buyer_name}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('sales.sale_date')}
              </Typography>
              <Typography variant="body1">{formatDate(new Date(sale.sale_date))}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('sales.total_amount')}
              </Typography>
              <Typography variant="body1">{formatCurrency(sale.total_amount)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('sales.payment_status')}
              </Typography>
              <Chip
                label={getStatusLabel(sale.payment_status)}
                color={getStatusColor(sale.payment_status)}
                size="small"
              />
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('pending')}>
          <Chip 
            label={t('sales.pending')}
            color="error" 
            size="small" 
            sx={{ minWidth: 80 }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('partial')}>
          <Chip 
            label={t('sales.partial')}
            color="warning" 
            size="small" 
            sx={{ minWidth: 80 }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('paid')}>
          <Chip 
            label={t('sales.paid')}
            color="success" 
            size="small"
            sx={{ minWidth: 80 }}
          />
        </MenuItem>
      </Menu>
    </Dialog>
  );
};