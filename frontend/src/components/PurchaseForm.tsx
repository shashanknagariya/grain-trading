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
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { formatWeight, formatCurrency } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';

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
  seller_name: string;
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
  seller_name: string;
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
  const [formData, setFormData] = useState<PurchaseFormData>({
    grain_id: '',
    seller_name: '',
    number_of_bags: '',
    weight_per_bag: '',
    extra_weight: '0',
    total_weight: '',
    rate_per_kg: '',
    godown_id: '',
    purchase_date: new Date()
  });
  const [grains, setGrains] = useState<Grain[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [grainsResponse, godownsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/grains`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/godowns`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!grainsResponse.ok || !godownsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [grainsData, godownsData] = await Promise.all([
        grainsResponse.json(),
        godownsResponse.json()
      ]);

      setGrains(grainsData);
      setGodowns(godownsData);
    } catch (err) {
      setError('Failed to load form data');
      showError('Failed to load form data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      // Validate all required fields first
      const requiredFields: Record<string, string> = {
        grain_id: 'Grain',
        seller_name: 'Seller Name',
        number_of_bags: 'Number of Bags',
        weight_per_bag: 'Weight per Bag',
        rate_per_kg: 'Rate per KG',
        godown_id: 'Godown'
      };

      const missingFields: string[] = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field as keyof PurchaseFormData] || String(formData[field as keyof PurchaseFormData]).trim() === '') {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        showError(`Missing required fields: ${missingFields.join(', ')}`);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Parse and validate numeric fields
      const numberFields = {
        number_of_bags: parseInt(formData.number_of_bags),
        weight_per_bag: parseFloat(formData.weight_per_bag),
        rate_per_kg: parseFloat(formData.rate_per_kg),
        extra_weight: parseFloat(formData.extra_weight || '0')
      };

      // Validate numeric fields
      for (const [field, value] of Object.entries(numberFields)) {
        if (isNaN(value) || value < 0) {
          showError(`Invalid value for ${field}`);
          throw new Error(`Invalid value for ${field}`);
        }
      }

      // Calculate total weight
      const totalWeight = (numberFields.number_of_bags * numberFields.weight_per_bag) + numberFields.extra_weight;

      // Prepare the payload
      const payload: PurchasePayload = {
        grain_id: parseInt(formData.grain_id),
        seller_name: formData.seller_name.trim(),
        number_of_bags: numberFields.number_of_bags,
        weight_per_bag: numberFields.weight_per_bag,
        extra_weight: numberFields.extra_weight,
        total_weight: totalWeight,
        rate_per_kg: numberFields.rate_per_kg,
        godown_id: parseInt(formData.godown_id),
        purchase_date: (formData.purchase_date || new Date()).toISOString()
      };

      // Log the payload for debugging
      console.log('Submitting purchase with payload:', payload);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (e) {
        // If response is not JSON
        responseData = { message: 'Server error' };
      }

      if (!response.ok) {
        showError(responseData.message || `Failed to create purchase: ${response.status}`);
        throw new Error(responseData.message || `Failed to create purchase: ${response.status}`);
      }

      onSubmit(payload);
      handleClose();
    } catch (err) {
      console.error('Purchase creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      grain_id: '',
      seller_name: '',
      number_of_bags: '',
      weight_per_bag: '',
      extra_weight: '0',
      total_weight: '',
      rate_per_kg: '',
      godown_id: '',
      purchase_date: new Date()
    });
    setError('');
    onClose();
  };

  const calculateTotals = () => {
    const bags = parseInt(formData.number_of_bags) || 0;
    const weightPerBag = parseFloat(formData.weight_per_bag) || 0;
    const extraWeight = parseFloat(formData.extra_weight) || 0;
    const ratePerKg = parseFloat(formData.rate_per_kg) || 0;

    if (isNaN(bags) || isNaN(weightPerBag) || isNaN(extraWeight) || isNaN(ratePerKg)) {
      return {
        totalWeight: formatWeight(0),
        totalAmount: formatCurrency(0)
      };
    }

    const totalWeight = (bags * weightPerBag) + extraWeight;
    const totalAmount = totalWeight * ratePerKg;

    return {
      totalWeight: formatWeight(totalWeight),
      totalAmount: formatCurrency(totalAmount)
    };
  };

  const { totalWeight, totalAmount } = calculateTotals();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Purchase</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Grain</InputLabel>
                <Select
                  value={formData.grain_id}
                  onChange={(e) => setFormData({ ...formData, grain_id: e.target.value })}
                  label="Grain"
                >
                  {grains.map((grain) => (
                    <MenuItem key={grain.id} value={grain.id}>{grain.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Godown</InputLabel>
                <Select
                  value={formData.godown_id}
                  onChange={(e) => setFormData({ ...formData, godown_id: e.target.value })}
                  label="Godown"
                >
                  {godowns.map((godown) => (
                    <MenuItem key={godown.id} value={godown.id}>{godown.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Bags"
                type="number"
                value={formData.number_of_bags}
                onChange={(e) => setFormData({ ...formData, number_of_bags: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight per Bag (kg)"
                type="number"
                value={formData.weight_per_bag}
                onChange={(e) => setFormData({ ...formData, weight_per_bag: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Extra Weight (kg)"
                type="number"
                value={formData.extra_weight}
                onChange={(e) => setFormData({ ...formData, extra_weight: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rate per KG"
                type="number"
                value={formData.rate_per_kg}
                onChange={(e) => setFormData({ ...formData, rate_per_kg: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Name"
                value={formData.seller_name}
                onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Purchase Date"
                value={formData.purchase_date}
                onChange={(date) => setFormData({ ...formData, purchase_date: date })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Weight"
                value={totalWeight}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Amount"
                value={totalAmount}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Purchase'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 