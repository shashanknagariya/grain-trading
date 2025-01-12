import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Box,
  Paper,
  Table,
  Chip,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  InputLabel,
  Button,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { userService, type User, type CreateUserData, type UpdateUserData } from '../services/userService';
import { Roles, Permissions } from '../constants/permissions';
import { PermissionGuard } from '../components/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { UserFormDialog } from '../components/UserFormDialog';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';

export const Users: FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await userService.updateRole(userId, newRole);
      loadUsers();
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleCreateUser = async (userData: CreateUserData | UpdateUserData) => {
    if ('username' in userData) {  // Type guard to check if it's CreateUserData
      try {
        await userService.create(userData);
        loadUsers();
      } catch (err) {
        throw err;
      }
    }
  };

  const handleEditUser = async (userData: UpdateUserData) => {
    if (!userToEdit) return;
    try {
      await userService.update(userToEdit.id, userData);
      loadUsers();
      setUserToEdit(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.delete(userToDelete.id);
      loadUsers();
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
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
      permission={Permissions.MANAGE_USERS}
      fallback={<Typography>You don't have permission to view this page.</Typography>}
    >
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">User Management</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create User
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        size="small"
                        disabled={user.id === currentUser?.id}
                      >
                        {Object.values(Roles).map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.permissions?.map((permission) => (
                        <Tooltip key={permission} title={permission}>
                          <Chip
                            label={permission.split(':')[1]}
                            size="small"
                            color={permission.includes('admin') ? 'error' : 'primary'}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => setUserToEdit(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setUserToDelete(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <UserFormDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          onSubmit={(data) => {
            if (data && 'username' in data) {
              return handleCreateUser(data as CreateUserData);
            }
            return Promise.reject('Invalid data for create mode');
          }}
          mode="create"
        />

        <UserFormDialog
          open={!!userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={handleEditUser}
          mode="edit"
          initialData={userToEdit || undefined}
        />

        <DeleteConfirmationDialog
          open={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          content={`Are you sure you want to delete user ${userToDelete?.username}? This action cannot be undone.`}
        />
      </Box>
    </PermissionGuard>
  );
}; 