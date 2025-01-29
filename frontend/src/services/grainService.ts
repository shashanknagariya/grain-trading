import { getAuthHeader } from '../utils/auth';

export interface Grain {
  id: number;
  name: string;
  variety?: string;
  description?: string;
  created_at: string;
}

export const grainService = {
  async getAll(): Promise<Grain[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch grains');
    return response.json();
  },

  async getById(id: number): Promise<Grain> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains/${id}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch grain');
    return response.json();
  },

  async create(grain: Omit<Grain, 'id' | 'created_at'>): Promise<Grain> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grain)
    });
    if (!response.ok) throw new Error('Failed to create grain');
    return response.json();
  },

  async update(id: number, grain: Partial<Grain>): Promise<Grain> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grain)
    });
    if (!response.ok) throw new Error('Failed to update grain');
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/grains/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete grain');
  }
}; 