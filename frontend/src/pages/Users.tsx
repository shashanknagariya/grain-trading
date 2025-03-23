import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Box,
  Paper,
  Table,
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
  Button,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { Permissions } from '../constants/permissions';
import { PermissionGuard } from '../components/PermissionGuard';
import { useAuth } from '../contexts/AuthContext';
import { UserFormDialog } from '../components/UserFormDialog';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../utils/formatters';

// Define the types that were previously imported
interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
}

interface UpdateUserData {
  email?: string;
  role?: string;
  permissions?: string[];
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  lastLogin: Date;
  permissions: string[];  // Make this required
}

// Use User interface instead of LocalUser
type LocalUser = User;  // Now they're the same type

// Rename to avoid conflict with imported constant
const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const Users: FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<LocalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<LocalUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
  const { showError, showSuccess } = useNotification();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      // Convert string dates to Date objects
      const formattedUsers = data.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: new Date(user.lastLogin)
      }));
      setUsers(formattedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      await loadUsers();
      showSuccess('Role updated successfully');
    } catch (err) {
      showError('Failed to update user role');
    }
  };

  const handleCreateUser = async (userData: CreateUserData | UpdateUserData) => {
    if ('username' in userData) {  // Type guard to check if it's CreateUserData
      try {
        await userService.create(userData);
        loadUsers();
        showSuccess('User created successfully');
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
      setUserToEdit(undefined);
      showSuccess('User updated successfully');
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
      showSuccess('User deleted successfully');
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

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
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
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        size="small"
                        disabled={user.id === currentUser?.id}
                      >
                        {Object.values(USER_ROLES).map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
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
          onClose={() => setUserToEdit(undefined)}
          onSubmit={handleEditUser}
          mode="edit"
          initialData={userToEdit}
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