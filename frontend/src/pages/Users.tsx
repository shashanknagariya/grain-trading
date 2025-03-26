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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { userService, type User } from '../services/userService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Permissions } from '../constants/permissions';
import { PermissionGuard } from '../components/PermissionGuard';
import { useNotification } from '../contexts/NotificationContext';

const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const Users: FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: USER_ROLES.STAFF as UserRole
  });

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role as UserRole
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: USER_ROLES.STAFF
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: USER_ROLES.STAFF
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, {
          email: formData.email,
          role: formData.role
        });
      } else {
        await userService.create(formData);
      }
      handleCloseDialog();
      loadUsers();
      showSuccess(t('users.success'));
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('users.confirmDelete'))) {
      try {
        await userService.delete(id);
        loadUsers();
        showSuccess(t('users.success'));
      } catch (err) {
        setError(t('common.error'));
      }
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await userService.updateRole(userId, newRole);
      loadUsers();
      showSuccess(t('users.success'));
    } catch (err) {
      showError(t('common.error'));
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
      fallback={<Typography>{t('common.noPermission')}</Typography>}
    >
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">{t('users.title')}</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('users.addUser')}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.username')}</TableCell>
                <TableCell>{t('users.email')}</TableCell>
                <TableCell>{t('users.role')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
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
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => handleOpenDialog(user)} 
                            size="small"
                        disabled={user.id === currentUser?.id}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(user.id)} 
                        size="small" 
                        color="error"
                        disabled={user.id === currentUser?.id}
                      >
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
              {selectedUser ? t('users.editUser') : t('users.addUser')}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={t('users.username')}
                fullWidth
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={!!selectedUser}
              />
              <TextField
                margin="dense"
                label={t('users.email')}
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {!selectedUser && (
                <TextField
                  margin="dense"
                  label={t('users.password')}
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              )}
              <FormControl fullWidth margin="dense">
                <InputLabel id="role-label">{t('users.role')}</InputLabel>
                <Select
                  labelId="role-label"
                  value={formData.role}
                  label={t('users.role')}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  required
                >
                  {Object.values(USER_ROLES).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
    </PermissionGuard>
  );
}; 