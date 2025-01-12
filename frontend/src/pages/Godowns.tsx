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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { godownService, type Godown, type CreateGodownData } from '../services/godownService';
import { PermissionGuard } from '../components/PermissionGuard';
import { Permissions } from '../constants/permissions';
import { GodownFormDialog } from '../components/GodownFormDialog';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';

export const Godowns: FC = () => {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [godownToEdit, setGodownToEdit] = useState<Godown | null>(null);
  const [godownToDelete, setGodownToDelete] = useState<Godown | null>(null);

  const loadGodowns = async () => {
    try {
      const data = await godownService.getAll();
      setGodowns(data);
      setError('');
    } catch (err) {
      setError('Failed to load godowns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGodowns();
  }, []);

  const handleCreate = async (data: CreateGodownData) => {
    try {
      await godownService.create(data);
      loadGodowns();
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = async (data: Partial<CreateGodownData>) => {
    if (!godownToEdit) return;
    try {
      await godownService.update(godownToEdit.id, data);
      loadGodowns();
      setGodownToEdit(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!godownToDelete) return;
    try {
      await godownService.delete(godownToDelete.id);
      loadGodowns();
      setGodownToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete godown');
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
    <PermissionGuard 
      permission={Permissions.MANAGE_INVENTORY}
      fallback={<Typography>You don't have permission to view this page.</Typography>}
    >
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Godown Management</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Add Godown
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Capacity (Bags)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {godowns.map((godown) => (
                <TableRow key={godown.id}>
                  <TableCell>{godown.name}</TableCell>
                  <TableCell>{godown.location}</TableCell>
                  <TableCell>{godown.capacity}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={() => setGodownToEdit(godown)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => setGodownToDelete(godown)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <GodownFormDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          onSubmit={handleCreate}
          mode="create"
        />

        <GodownFormDialog
          open={!!godownToEdit}
          onClose={() => setGodownToEdit(null)}
          onSubmit={handleEdit}
          mode="edit"
          initialData={godownToEdit || undefined}
        />

        <DeleteConfirmationDialog
          open={!!godownToDelete}
          onClose={() => setGodownToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Godown"
          content={`Are you sure you want to delete godown ${godownToDelete?.name}? This action cannot be undone.`}
        />
      </Box>
    </PermissionGuard>
  );
}; 