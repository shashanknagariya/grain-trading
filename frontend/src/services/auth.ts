import { API_URL } from './api';
import type { LoginCredentials } from '../types/auth';

export const login = async (credentials: LoginCredentials) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}; 