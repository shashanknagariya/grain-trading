import { getAuthHeader } from '../utils/auth';

export interface Sale {
  id: number;
  grain_id: number;
  grain_name: string;
  quantity: number;
  price_per_unit: number;
  customer_name: string;
  sale_date: string;
  created_at: string;
}

export interface CreateSaleData {
  grain_id: number;
  quantity: number;
  price_per_unit: number;
  customer_name: string;
  sale_date: string;
}

export interface SalesSummary {
  monthly_sales: number;
  sales_by_grain: Array<{
    grain_name: string;
    total_quantity: number;
    total_value: number;
  }>;
}

export const saleService = {
  async getAll(): Promise<Sale[]> {
    const response = await fetch('http://localhost:5000/api/sales', {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
  },

  async getById(id: number): Promise<Sale> {
    const response = await fetch(`http://localhost:5000/api/sales/${id}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch sale');
    return response.json();
  },

  async create(sale: CreateSaleData): Promise<Sale> {
    const response = await fetch('http://localhost:5000/api/sales', {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sale)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create sale');
    }
    return response.json();
  },

  async getSummary(): Promise<SalesSummary> {
    const response = await fetch('http://localhost:5000/api/sales/summary', {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch sales summary');
    return response.json();
  }
}; 