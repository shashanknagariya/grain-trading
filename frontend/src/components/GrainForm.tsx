import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';

interface GrainFormProps {
  onSubmit: () => void;
}

export const GrainForm: React.FC<GrainFormProps> = ({ onSubmit }) => {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create grain');
      }

      showSuccess('Grain created successfully');
      setFormData({ name: '' });
      onSubmit();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create grain');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Grain
        </Typography>
        
        <TextField
          fullWidth
          required
          name="name"
          label="Grain Name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />

        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creating...' : 'Create Grain'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}; 