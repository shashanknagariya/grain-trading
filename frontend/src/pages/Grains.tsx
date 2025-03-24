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
import { useTranslation } from 'react-i18next';

export const Grains: FC = () => {
  const { t } = useTranslation();
  const [grains, setGrains] = useState<Grain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGrain, setSelectedGrain] = useState<Grain | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const loadGrains = async () => {
    try {
      const data = await grainService.getAll();
      setGrains(data);
      setError('');
    } catch (err) {
      setError(t('common.error'));
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
      setFormData({ name: grain.name });
    } else {
      setSelectedGrain(null);
      setFormData({ name: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGrain(null);
    setFormData({ name: '' });
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
      setError(t('common.error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('grains.confirmDelete'))) {
      try {
        await grainService.delete(id);
        loadGrains();
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
        <Typography variant="h5">{t('grains.title')}</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          {t('grains.addGrain')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('grains.grainName')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grains.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            ) : (
              grains.map((grain) => (
                <TableRow key={grain.id}>
                  <TableCell>{grain.name}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(grain)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(grain.id)} size="small" color="error">
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
            {selectedGrain ? t('grains.editGrain') : t('grains.addGrain')}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t('grains.grainName')}
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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