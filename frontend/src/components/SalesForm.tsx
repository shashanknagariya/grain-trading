import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material';
import { Grain } from '../types/grain';
import { Godown } from '../types/godown';
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
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [selectedGodown, setSelectedGodown] = useState<string>('');
  const [godownBags, setGodownBags] = useState<string>('');
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

  const fetchGodowns = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/godowns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error(t('errors.fetch_error'));
      const data = await response.json();
      setGodowns(data);
    } catch (error) {
      showError(t('errors.fetch_error'));
    }
  };

  useEffect(() => {
    if (open) {
      fetchGrains();
      fetchGodowns();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate godown details
    if (formData.godown_details.length === 0) {
      showError(t('sales.errors.no_godown_selected'));
      return;
    }

    const totalBags = formData.godown_details.reduce((sum, detail) => sum + detail.number_of_bags, 0);
    if (totalBags !== parseInt(formData.number_of_bags)) {
      showError(t('sales.errors.bags_mismatch'));
      return;
    }

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
      setSelectedGodown('');
      setGodownBags('');
    } catch (error) {
      showError(t('errors.save_error'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGodown = () => {
    if (!selectedGodown || !godownBags) {
      showError(t('sales.errors.invalid_godown_details'));
      return;
    }

    const newGodownDetails = [...formData.godown_details];
    const existingIndex = newGodownDetails.findIndex(d => d.godown_id === selectedGodown);

    if (existingIndex >= 0) {
      newGodownDetails[existingIndex].number_of_bags += parseInt(godownBags);
    } else {
      newGodownDetails.push({
        godown_id: selectedGodown,
        number_of_bags: parseInt(godownBags)
      });
    }

    setFormData(prev => ({
      ...prev,
      godown_details: newGodownDetails
    }));

    setSelectedGodown('');
    setGodownBags('');
  };

  const handleRemoveGodown = (godownId: string) => {
    setFormData(prev => ({
      ...prev,
      godown_details: prev.godown_details.filter(d => d.godown_id !== godownId)
    }));
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
                label={t('sales.grain_name')}
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
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>{t('sales.select_godown')}</InputLabel>
                    <Select
                      value={selectedGodown}
                      onChange={(e) => setSelectedGodown(e.target.value)}
                      input={<OutlinedInput label={t('sales.select_godown')} />}
                    >
                      {godowns.map((godown) => (
                        <MenuItem key={godown.id} value={godown.id}>
                          {godown.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('sales.bags_from_godown')}
                    value={godownBags}
                    onChange={(e) => setGodownBags(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="contained"
                    onClick={handleAddGodown}
                    fullWidth
                  >
                    {t('common.add')}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {formData.godown_details.map((detail, index) => (
              <Grid item xs={12} key={index}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    {godowns.find(g => g.id === detail.godown_id)?.name}: {detail.number_of_bags} {t('sales.bags')}
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveGodown(detail.godown_id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="buyer_gst"
                label={t('sales.customer_gst')}
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
          <Button type="submit" variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};