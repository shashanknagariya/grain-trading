import { getAuthHeader } from '../utils/auth';

export interface Purchase {
  id: number;
  grain_id: number;
  grain_name: string;
  godown_id: number;
  godown_name: string;
  number_of_bags: number;
  weight_per_bag: number;
  extra_weight: number;
  rate_per_kg: number;
  total_weight: number;
  total_amount: number;
  supplier_name: string;
  purchase_date: string;
  created_at: string;
}

export interface CreatePurchaseData {
  grain_id: number;
  godown_id: number;
  number_of_bags: number;
  weight_per_bag: number;
  extra_weight?: number;
  rate_per_kg: number;
  supplier_name: string;
  purchase_date: string;
}

export const purchaseService = {
  async getAll(): Promise<Purchase[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  },

  async getById(id: number): Promise<Purchase> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/${id}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch purchase');
    return response.json();
  },

  async create(purchase: CreatePurchaseData): Promise<Purchase> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(purchase)
    });
    if (!response.ok) throw new Error('Failed to create purchase');
    return response.json();
  }
}; 