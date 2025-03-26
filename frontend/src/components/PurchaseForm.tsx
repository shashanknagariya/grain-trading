import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Box,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { formatWeight } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

interface Grain {
  id: number;
  name: string;
}

interface Godown {
  id: number;
  name: string;
}

interface PurchaseFormData {
  grain_id: string;
  supplier_name: string;
  number_of_bags: string;
  weight_per_bag: string;
  extra_weight: string;
  total_weight: string;
  rate_per_kg: string;
  godown_id: string;
  purchase_date: Date | null;
}

interface PurchasePayload {
  grain_id: number;
  supplier_name: string;
  number_of_bags: number;
  weight_per_bag: number;
  extra_weight: number;
  total_weight: number;
  rate_per_kg: number;
  godown_id: number;
  purchase_date: string;
}

interface PurchaseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PurchasePayload) => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const { t } = useTranslation();
  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [grains, setGrains] = useState<Grain[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [formData, setFormData] = useState<PurchaseFormData>({
    grain_id: '',
    supplier_name: '',
    number_of_bags: '',
    weight_per_bag: '',
    extra_weight: '0',
    total_weight: '0',
    rate_per_kg: '',
    godown_id: '',
    purchase_date: new Date()
  });

  useEffect(() => {
    fetchGrainsAndGodowns();
  }, []);

  const fetchGrainsAndGodowns = async () => {
    try {
      setLoading(true);
      const [grainsResponse, godownsResponse] = await Promise.all([
        api.get('/api/grains'),
        api.get('/api/godowns')
      ]);
      setGrains(grainsResponse.data);
      setGodowns(godownsResponse.data);
    } catch (error) {
      showError(t('errors.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalWeight = () => {
    const bags = parseFloat(formData.number_of_bags) || 0;
    const weightPerBag = parseFloat(formData.weight_per_bag) || 0;
    const extraWeight = parseFloat(formData.extra_weight) || 0;
    const totalWeight = (bags * weightPerBag) + extraWeight;
    setFormData(prev => ({ ...prev, total_weight: totalWeight.toFixed(2) }));
  };

  useEffect(() => {
    calculateTotalWeight();
  }, [formData.number_of_bags, formData.weight_per_bag, formData.extra_weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purchase_date) {
      showError(t('purchases.errors.date_required'));
      return;
    }

    try {
      const payload: PurchasePayload = {
        grain_id: parseInt(formData.grain_id),
        supplier_name: formData.supplier_name,
        number_of_bags: parseInt(formData.number_of_bags),
        weight_per_bag: parseFloat(formData.weight_per_bag),
        extra_weight: parseFloat(formData.extra_weight || '0'),
        total_weight: parseFloat(formData.total_weight),
        rate_per_kg: parseFloat(formData.rate_per_kg),
        godown_id: parseInt(formData.godown_id),
        purchase_date: formData.purchase_date.toISOString()
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      showError(t('purchases.errors.create_error'));
    }
  };

  const handleSelectChange = (field: keyof PurchaseFormData) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleInputChange = (field: keyof PurchaseFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{t('purchases.add_purchase')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('purchases.grain')}</InputLabel>
                <Select
                  value={formData.grain_id}
                  onChange={handleSelectChange('grain_id')}
                  required
                  label={t('purchases.grain')}
                >
                  {grains.map(grain => (
                    <MenuItem key={grain.id} value={grain.id}>
                      {grain.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('purchases.godown')}</InputLabel>
                <Select
                  value={formData.godown_id}
                  onChange={handleSelectChange('godown_id')}
                  required
                  label={t('purchases.godown')}
                >
                  {godowns.map(godown => (
                    <MenuItem key={godown.id} value={godown.id}>
                      {godown.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('purchases.supplier_name')}
                value={formData.supplier_name}
                onChange={handleInputChange('supplier_name')}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('purchases.number_of_bags')}
                value={formData.number_of_bags}
                onChange={handleInputChange('number_of_bags')}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('purchases.weight_per_bag')}
                value={formData.weight_per_bag}
                onChange={handleInputChange('weight_per_bag')}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('purchases.extra_weight')}
                value={formData.extra_weight}
                onChange={handleInputChange('extra_weight')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label={t('purchases.rate_per_kg')}
                value={formData.rate_per_kg}
                onChange={handleInputChange('rate_per_kg')}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('purchases.total_weight')}
                value={formatWeight(parseFloat(formData.total_weight))}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label={t('purchases.purchase_date')}
                value={formData.purchase_date}
                onChange={(date) => setFormData(prev => ({ ...prev, purchase_date: date }))}
                slotProps={{ textField: { fullWidth: true, required: true } }}
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