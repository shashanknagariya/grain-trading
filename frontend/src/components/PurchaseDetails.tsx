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
import { Purchase } from '../types/purchase';
import { useTranslation } from 'react-i18next';

interface PurchaseDetailsProps {
  open: boolean;
  onClose: () => void;
  purchase: Purchase | null;
  onPrint: () => void;
  handlePaymentStatusChange?: (purchaseId: number, newStatus: 'pending' | 'paid' | 'partial') => void;
}

export const PurchaseDetails: React.FC<PurchaseDetailsProps> = ({ 
  open, 
  onClose, 
  purchase, 
  onPrint,
  handlePaymentStatusChange 
}) => {
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
    if (purchase && handlePaymentStatusChange) {
      await handlePaymentStatusChange(purchase.id, newStatus);
      handleStatusMenuClose();
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

  if (!purchase) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{t('purchases.purchase_details')}</Typography>
          <Box>
            <IconButton onClick={onPrint} size="small">
              <PrintIcon />
            </IconButton>
            {handlePaymentStatusChange && (
              <IconButton onClick={handleStatusMenuClick} size="small">
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.seller_name')}
              </Typography>
              <Typography variant="body1">{purchase.seller_name}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.purchase_date')}
              </Typography>
              <Typography variant="body1">{formatDate(new Date(purchase.purchase_date))}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.grain_name')}
              </Typography>
              <Typography variant="body1">{purchase.grain_name}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.total_amount')}
              </Typography>
              <Typography variant="body1">{formatCurrency(purchase.total_amount)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.payment_status')}
              </Typography>
              <Chip
                label={t(`purchases.${purchase.payment_status}`)}
                color={getStatusColor(purchase.payment_status)}
                size="small"
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.number_of_bags')}
              </Typography>
              <Typography variant="body1">{purchase.number_of_bags}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.total_weight')}
              </Typography>
              <Typography variant="body1">{purchase.total_weight ? `${purchase.total_weight} kg` : '-'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('purchases.rate_per_kg')}
              </Typography>
              <Typography variant="body1">{formatCurrency(purchase.rate_per_kg)}</Typography>
            </Paper>
          </Grid>
          {purchase.transportation_mode && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('purchases.transportation_mode')}
                </Typography>
                <Typography variant="body1">{purchase.transportation_mode}</Typography>
              </Paper>
            </Grid>
          )}
          {purchase.vehicle_number && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('purchases.vehicle_number')}
                </Typography>
                <Typography variant="body1">{purchase.vehicle_number}</Typography>
              </Paper>
            </Grid>
          )}
          {purchase.driver_name && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('purchases.driver_name')}
                </Typography>
                <Typography variant="body1">{purchase.driver_name}</Typography>
              </Paper>
            </Grid>
          )}
          {purchase.lr_number && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('purchases.lr_number')}
                </Typography>
                <Typography variant="body1">{purchase.lr_number}</Typography>
              </Paper>
            </Grid>
          )}
          {purchase.po_number && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('purchases.po_number')}
                </Typography>
                <Typography variant="body1">{purchase.po_number}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>

      {handlePaymentStatusChange && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleStatusMenuClose}
        >
          <MenuItem onClick={() => handleStatusChange('pending')}>
            <Chip 
              label={t('purchases.pending')}
              color="error" 
              size="small" 
              sx={{ minWidth: 80 }}
            />
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('partial')}>
            <Chip 
              label={t('purchases.partial')}
              color="warning" 
              size="small" 
              sx={{ minWidth: 80 }}
            />
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('paid')}>
            <Chip 
              label={t('purchases.paid')}
              color="success" 
              size="small"
              sx={{ minWidth: 80 }}
            />
          </MenuItem>
        </Menu>
      )}
    </Dialog>
  );
};