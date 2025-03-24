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
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { godownService, type Godown } from '../services/godownService';
import { useTranslation } from 'react-i18next';

export const Godowns: FC = () => {
  const { t } = useTranslation();
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGodown, setSelectedGodown] = useState<Godown | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });

  const loadGodowns = async () => {
    try {
      const data = await godownService.getAll();
      setGodowns(data);
      setError('');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGodowns();
  }, []);

  const handleOpenDialog = (godown?: Godown) => {
    if (godown) {
      setSelectedGodown(godown);
      setFormData({
        name: godown.name,
        location: godown.location,
        capacity: godown.capacity.toString()
      });
    } else {
      setSelectedGodown(null);
      setFormData({
        name: '',
        location: '',
        capacity: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGodown(null);
    setFormData({
      name: '',
      location: '',
      capacity: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const godownData = {
        ...formData,
        capacity: parseInt(formData.capacity, 10)
      };

      if (selectedGodown) {
        await godownService.update(selectedGodown.id, godownData);
      } else {
        await godownService.create(godownData);
      }
      handleCloseDialog();
      loadGodowns();
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('godowns.confirmDelete'))) {
      try {
        await godownService.delete(id);
        loadGodowns();
      } catch (err) {
        setError(t('common.error'));
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
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">{t('godowns.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          {t('godowns.addGodown')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('godowns.godownName')}</TableCell>
              <TableCell>{t('godowns.location')}</TableCell>
              <TableCell>{t('godowns.capacity')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {godowns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              godowns.map((godown) => (
                <TableRow key={godown.id}>
                  <TableCell>{godown.name}</TableCell>
                  <TableCell>{godown.location}</TableCell>
                  <TableCell>{godown.capacity}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(godown)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(godown.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedGodown ? t('godowns.editGodown') : t('godowns.addGodown')}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('godowns.godownName')}
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label={t('godowns.location')}
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label={t('godowns.capacity')}
              fullWidth
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" color="primary">
              {t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};