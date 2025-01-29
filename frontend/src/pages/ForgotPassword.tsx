import React, { useState } from 'react';
import type { FC } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Link } from '@mui/material';

export const ForgotPassword: FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to process request');
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to process request. Please try again.');
    }
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Reset Instructions Sent
        </Typography>
        <Typography>
          If an account exists with this email, you will receive password reset instructions.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Link component={RouterLink} to="/login">
            Return to Login
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        p: 3,
        boxShadow: 3,
        borderRadius: 1,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Forgot Password
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField
        fullWidth
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        required
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
      >
        Send Reset Instructions
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login">
          Back to Login
        </Link>
      </Box>
    </Box>
  );
}; 