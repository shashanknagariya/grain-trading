import { getAuthHeader } from '../utils/auth';

export interface InventoryItem {
  id: number;
  grain_id: number;
  grain_name: string;
  quantity: number;
  last_updated: string;
}

export interface InventoryHistory {
  grain_name: string;
  current_stock: number;
  history: Array<{
    type: 'purchase' | 'sale';
    quantity: number;
    date: string;
    details: string;
  }>;
}

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const response = await fetch('http://localhost:5000/api/inventory', {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  async getLowStock(): Promise<InventoryItem[]> {
    const response = await fetch('http://localhost:5000/api/inventory/low-stock', {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch low stock items');
    return response.json();
  },

  async getHistory(grainId: number): Promise<InventoryHistory> {
    const response = await fetch(`http://localhost:5000/api/inventory/${grainId}/history`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch inventory history');
    return response.json();
  }
}; 