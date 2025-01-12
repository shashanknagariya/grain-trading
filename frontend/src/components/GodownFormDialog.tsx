import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import type { Godown, CreateGodownData } from '../services/godownService';

interface GodownFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGodownData) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Godown;
}

export const GodownFormDialog: FC<GodownFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  mode,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateGodownData>({
    name: '',
    location: '',
    capacity: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        location: initialData.location,
        capacity: initialData.capacity
      });
    } else {
      setFormData({
        name: '',
        location: '',
        capacity: 0
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({ name: '', location: '', capacity: 0 });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save godown');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{mode === 'create' ? 'Add New Godown' : 'Edit Godown'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            type="number"
            label="Capacity (Bags)"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 