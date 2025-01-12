import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { grainService, type Grain } from '../services/grainService';

export const Grains: FC = () => {
  const [grains, setGrains] = useState<Grain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGrain, setSelectedGrain] = useState<Grain | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    description: ''
  });

  const loadGrains = async () => {
    try {
      const data = await grainService.getAll();
      setGrains(data);
      setError('');
    } catch (err) {
      setError('Failed to load grains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrains();
  }, []);

  const handleOpenDialog = (grain?: Grain) => {
    if (grain) {
      setSelectedGrain(grain);
      setFormData({
        name: grain.name,
        variety: grain.variety || '',
        description: grain.description || ''
      });
    } else {
      setSelectedGrain(null);
      setFormData({
        name: '',
        variety: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGrain(null);
    setFormData({
      name: '',
      variety: '',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGrain) {
        await grainService.update(selectedGrain.id, formData);
      } else {
        await grainService.create(formData);
      }
      handleCloseDialog();
      loadGrains();
    } catch (err) {
      setError('Failed to save grain');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this grain?')) {
      try {
        await grainService.delete(id);
        loadGrains();
      } catch (err) {
        setError('Failed to delete grain');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Grain Management</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add New Grain
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Variety</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grains.map((grain) => (
              <TableRow key={grain.id}>
                <TableCell>{grain.name}</TableCell>
                <TableCell>{grain.variety}</TableCell>
                <TableCell>{grain.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(grain)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(grain.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedGrain ? 'Edit Grain' : 'Add New Grain'}
          </DialogTitle>
          <DialogContent>
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
              label="Variety"
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedGrain ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}; 