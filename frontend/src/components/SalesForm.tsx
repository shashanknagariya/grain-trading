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
import { GodownDetail } from '../types/inventory';
import { GodownBagSelector } from './GodownBagSelector';
import { useNotification } from '../contexts/NotificationContext';

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
  console.log('SalesForm rendered:', { open });

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
    number_of_bags: '',
  });
  const { showError } = useNotification();

  useEffect(() => {
    fetchGrains();
  }, []);

  const fetchGrains = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch grains');
      const data = await response.json();
      setGrains(data);
    } catch (error) {
      showError('Failed to fetch grains');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate godown details
      if (formData.godown_details.length === 0) {
        showError('Please select at least one godown');
        return;
      }

      // Validate number of bags
      const totalBags = formData.godown_details.reduce((sum, detail) => sum + Number(detail.number_of_bags), 0);
      if (totalBags === 0) {
        showError('Please enter number of bags');
        return;
      }

      // Convert string values to numbers
      const payload = {
        ...formData,
        grain_id: parseInt(formData.grain_id),
        number_of_bags: parseInt(formData.number_of_bags),
        total_weight: parseFloat(formData.total_weight),
        rate_per_kg: parseFloat(formData.rate_per_kg),
        godown_details: formData.godown_details.map(detail => ({
          ...detail,
          number_of_bags: parseInt(detail.number_of_bags.toString())
        }))
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sale');
      }

      onSubmit(formData);
      onClose();
      setFormData({
        grain_id: '',
        buyer_name: '',
        godown_details: [],
        total_weight: '',
        rate_per_kg: '',
        transportation_mode: '',
        vehicle_number: '',
        driver_name: '',
        number_of_bags: '',
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create sale');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGodownDetailsChange = (godownDetails: GodownDetail[]) => {
    setFormData(prev => ({
      ...prev,
      godown_details: godownDetails.map(detail => ({
        godown_id: detail.godown_id.toString(),
        number_of_bags: detail.number_of_bags
      })),
      number_of_bags: godownDetails.reduce((sum, detail) => 
        sum + Number(detail.number_of_bags), 0
      ).toString()
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      TransitionProps={{
        onEnter: () => {
          console.log('Dialog entering');
          fetchGrains();
        }
      }}
    >
      <DialogTitle>Create New Sale</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Grain"
                name="grain_id"
                value={formData.grain_id}
                onChange={handleChange}
                required
              >
                {grains.map(grain => (
                  <MenuItem key={grain.id} value={grain.id}>
                    {grain.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buyer Name"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              {formData.grain_id && (
                <GodownBagSelector
                  grainId={parseInt(formData.grain_id)}
                  onChange={handleGodownDetailsChange}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Weight (kg)"
                name="total_weight"
                type="number"
                value={formData.total_weight}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rate per KG"
                name="rate_per_kg"
                type="number"
                value={formData.rate_per_kg}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Transportation Details */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Transportation Mode"
                name="transportation_mode"
                value={formData.transportation_mode}
                onChange={handleChange}
                required
              >
                <MenuItem value="road">Road</MenuItem>
                <MenuItem value="rail">Rail</MenuItem>
                <MenuItem value="self">Self Pickup</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle Number"
                name="vehicle_number"
                value={formData.vehicle_number}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver Name"
                name="driver_name"
                value={formData.driver_name}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Optional Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LR Number"
                name="lr_number"
                value={formData.lr_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PO Number"
                name="po_number"
                value={formData.po_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buyer GST"
                name="buyer_gst"
                value={formData.buyer_gst}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 