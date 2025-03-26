import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  MenuItem,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Purchase } from '../types/purchase';
import { updatePurchase } from '../services/api';

export interface EditPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  purchase: Purchase;
  onUpdate: (updatedPurchase: Purchase) => void;
}

export const EditPurchaseModal: React.FC<EditPurchaseModalProps> = ({
  open,
  onClose,
  purchase,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Purchase>>({
    supplier_name: purchase.supplier_name,
    number_of_bags: purchase.number_of_bags,
    total_weight: purchase.total_weight,
    total_amount: purchase.total_amount,
    payment_status: purchase.payment_status,
  });

  useEffect(() => {
    setFormData({
      supplier_name: purchase.supplier_name,
      number_of_bags: purchase.number_of_bags,
      total_weight: purchase.total_weight,
      total_amount: purchase.total_amount,
      payment_status: purchase.payment_status,
    });
  }, [purchase]);

  const handleChange = (field: keyof Purchase) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const updatedPurchase = await updatePurchase(purchase.id, formData);
      enqueueSnackbar(t('purchases.update_success'), { variant: 'success' });
      onUpdate(updatedPurchase);
      onClose();
    } catch (error: any) {
      console.error('Error updating purchase:', error);
      setError(error.message || t('errors.update_error'));
      enqueueSnackbar(error.message || t('common.error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const paymentStatusOptions = [
    { value: 'paid', label: t('common.payment_status.paid') },
    { value: 'pending', label: t('common.payment_status.pending') },
    { value: 'partial', label: t('common.payment_status.partial') },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {t('purchases.edit_title')}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {t('purchases.bill_number')}: {purchase.bill_number}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('purchases.seller_name')}
              value={formData.supplier_name}
              onChange={handleChange('supplier_name')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label={t('purchases.number_of_bags')}
              value={formData.number_of_bags}
              onChange={handleChange('number_of_bags')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label={t('purchases.total_weight')}
              value={formData.total_weight}
              onChange={handleChange('total_weight')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label={t('purchases.total_amount')}
              value={formData.total_amount}
              onChange={handleChange('total_amount')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label={t('purchases.payment_status')}
              value={formData.payment_status}
              onChange={handleChange('payment_status')}
            >
              {paymentStatusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            t('common.save')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
