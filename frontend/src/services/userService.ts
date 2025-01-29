import { getAuthHeader } from '../utils/auth';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  role?: string;
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async updateRole(userId: number, role: string): Promise<User> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role })
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
  },

  async create(userData: CreateUserData): Promise<User> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }
    
    return response.json();
  },

  async delete(userId: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete user');
    }
  },

  async update(userId: number, userData: UpdateUserData): Promise<User> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }
    
    return response.json();
  }
}; 