import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { Roles } from '../constants/permissions';
import type { CreateUserData, UpdateUserData } from '../services/userService';
import type { User } from '../services/userService';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: User;
}

export const UserFormDialog: FC<UserFormDialogProps> = ({ open, onClose, onSubmit, mode, initialData }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || Roles.STAFF
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username,
        email: initialData.email,
        password: '',
        role: initialData.role
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      setFormData({ username: '', email: '', password: '', role: Roles.STAFF });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            disabled={mode === 'edit'}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required={mode === 'create'}
            helperText={mode === 'edit' ? 'Leave blank to keep current password' : ''}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
              required
            >
              {Object.values(Roles).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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