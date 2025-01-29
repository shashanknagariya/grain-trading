import React from 'react';
import { Box, Typography } from '@mui/material';
import { SalesForm } from '../components/SalesForm';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

export const CreateSale: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sale');
      }

      showSuccess('Sale created successfully');
      navigate('/sales');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create sale');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Create New Sale
      </Typography>
      <SalesForm onSubmit={handleSubmit} />
    </Box>
  );
}; 