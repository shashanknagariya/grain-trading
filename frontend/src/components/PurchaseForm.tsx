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

interface Grain {
  id: number;
  name: string;
}

interface Godown {
  id: number;
  name: string;
}

interface PurchaseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    bill_number: '',
    grain_id: '',
    godown_id: '',
    number_of_bags: '',
    weight_per_bag: '',
    extra_weight: '0',
    rate_per_kg: '',
    supplier_name: '',
    purchase_date: new Date()
  });
  const [grains, setGrains] = useState<Grain[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          grain_id: parseInt(formData.grain_id),
          godown_id: parseInt(formData.godown_id),
          number_of_bags: parseInt(formData.number_of_bags),
          weight_per_bag: parseFloat(formData.weight_per_bag),
          extra_weight: parseFloat(formData.extra_weight),
          rate_per_kg: parseFloat(formData.rate_per_kg),
          purchase_date: formData.purchase_date.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create purchase');
      }

      onSubmit();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      bill_number: '',
      grain_id: '',
      godown_id: '',
      number_of_bags: '',
      weight_per_bag: '',
      extra_weight: '0',
      rate_per_kg: '',
      supplier_name: '',
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
      <DialogTitle>Create Purchase</DialogTitle>
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
              value={formData.supplier_name}
              onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Purchase Date"
              value={formData.purchase_date}
              onChange={(date) => setFormData({ ...formData, purchase_date: date || new Date() })}
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
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 