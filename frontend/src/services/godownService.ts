import { getAuthHeader } from '../utils/auth';

export interface Godown {
  id: number;
  name: string;
  location: string;
  capacity: number;
  created_at: string;
}

export interface CreateGodownData {
  name: string;
  location: string;
  capacity: number;
}

export const godownService = {
  async getAll(): Promise<Godown[]> {
    const response = await fetch('http://localhost:5000/api/godowns', {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch godowns');
    return response.json();
  },

  async create(data: CreateGodownData): Promise<Godown> {
    const response = await fetch('http://localhost:5000/api/godowns', {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create godown');
    }
    
    return response.json();
  },

  async update(id: number, data: Partial<CreateGodownData>): Promise<Godown> {
    const response = await fetch(`http://localhost:5000/api/godowns/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update godown');
    }
    
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`http://localhost:5000/api/godowns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete godown');
    }
  }
}; 