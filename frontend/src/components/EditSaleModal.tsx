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
  Typography,
} from '@mui/material';
import { Sale } from '../types/sale';
import { updateSale } from '../services/api';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

interface EditSaleModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
  onUpdate: () => void;
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  open,
  onClose,
  sale,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Sale>>({});

  useEffect(() => {
    if (sale) {
      const saleDate = new Date(sale.sale_date);
      setFormData({
        buyer_name: sale.buyer_name,
        sale_date: saleDate.toISOString().split('T')[0],
        number_of_bags: sale.number_of_bags,
        total_weight: sale.total_weight,
        rate_per_kg: sale.rate_per_kg,
        transportation_mode: sale.transportation_mode,
        vehicle_number: sale.vehicle_number,
        driver_name: sale.driver_name,
      });
    }
  }, [sale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    try {
      setLoading(true);
      await updateSale(sale.id, formData);
      enqueueSnackbar(t('sales.update_success'), { variant: 'success' });
      onUpdate();
      onClose();
    } catch (error: any) {
      enqueueSnackbar(error.message || t('common.error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t('sales.edit_sale')}
        <Typography variant="subtitle1" color="textSecondary">
          {t('sales.bill_number')}: {sale.bill_number}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="buyer_name"
                label={t('sales.customer_name')}
                value={formData.buyer_name || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="sale_date"
                label={t('sales.sale_date')}
                type="date"
                value={formData.sale_date || ''}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="number_of_bags"
                label={t('sales.number_of_bags')}
                type="number"
                value={formData.number_of_bags || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="total_weight"
                label={t('sales.total_weight')}
                type="number"
                value={formData.total_weight || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="rate_per_kg"
                label={t('sales.rate_per_kg')}
                type="number"
                value={formData.rate_per_kg || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="transportation_mode"
                label={t('sales.transportation_mode')}
                value={formData.transportation_mode || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="vehicle_number"
                label={t('sales.vehicle_number')}
                value={formData.vehicle_number || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="driver_name"
                label={t('sales.driver_name')}
                value={formData.driver_name || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              t('common.save')
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
