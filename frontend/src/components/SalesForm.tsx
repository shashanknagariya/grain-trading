import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem
} from '@mui/material';
import { Grain } from '../types/grain';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export interface SaleFormData {
  grain_id: string;
  buyer_name: string;
  godown_details: Array<{
    godown_id: string;
    number_of_bags: number;
  }>;
  total_weight: string;
  rate_per_kg: string;
  transportation_mode: string;
  vehicle_number: string;
  driver_name: string;
  lr_number?: string;
  po_number?: string;
  buyer_gst?: string;
  number_of_bags: string;
}

interface SalesFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SaleFormData) => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({ open, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotification();

  const [grains, setGrains] = useState<Grain[]>([]);
  const [formData, setFormData] = useState<SaleFormData>({
    grain_id: '',
    buyer_name: '',
    godown_details: [],
    total_weight: '',
    rate_per_kg: '',
    transportation_mode: '',
    vehicle_number: '',
    driver_name: '',
    lr_number: '',
    po_number: '',
    buyer_gst: '',
    number_of_bags: ''
  });

  const fetchGrains = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t('errors.fetch_error'));
      const data = await response.json();
      setGrains(data);
    } catch (error) {
      showError(t('errors.fetch_error'));
    }
  };

  useEffect(() => {
    if (open) {
      fetchGrains();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(t('errors.save_error'));

      showSuccess(t('sales.sale_created'));
      onSubmit(formData);
      setFormData({
        grain_id: '',
        buyer_name: '',
        godown_details: [],
        total_weight: '',
        rate_per_kg: '',
        transportation_mode: '',
        vehicle_number: '',
        driver_name: '',
        lr_number: '',
        po_number: '',
        buyer_gst: '',
        number_of_bags: ''
      });
    } catch (error) {
      showError(t('errors.save_error'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t('sales.add_sale')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="grain_id"
                label={t('grains.name')}
                value={formData.grain_id}
                onChange={handleChange}
                required
              >
                {grains.map((grain) => (
                  <MenuItem key={grain.id} value={grain.id}>
                    {grain.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="buyer_name"
                label={t('sales.customer_name')}
                value={formData.buyer_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="buyer_gst"
                label={t('sales.buyer_gst')}
                value={formData.buyer_gst}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="number_of_bags"
                label={t('sales.number_of_bags')}
                type="number"
                value={formData.number_of_bags}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="total_weight"
                label={t('sales.total_weight')}
                type="number"
                value={formData.total_weight}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="rate_per_kg"
                label={t('sales.rate_per_kg')}
                type="number"
                value={formData.rate_per_kg}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="transportation_mode"
                label={t('sales.transportation_mode')}
                value={formData.transportation_mode}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="vehicle_number"
                label={t('sales.vehicle_number')}
                value={formData.vehicle_number}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="driver_name"
                label={t('sales.driver_name')}
                value={formData.driver_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lr_number"
                label={t('sales.lr_number')}
                value={formData.lr_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="po_number"
                label={t('sales.po_number')}
                value={formData.po_number}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};