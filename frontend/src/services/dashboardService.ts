import { getAuthHeader } from '../utils/auth';

export interface DashboardSummary {
  inventory_value: number;
  low_stock_count: number;
  monthly_purchase_total: number;
  recent_purchases: Array<{
    id: number;
    grain_name: string;
    quantity: number;
    price_per_unit: number;
    total: number;
    supplier_name: string;
    purchase_date: string;
  }>;
  recent_sales: Array<{
    id: number;
    grain_name: string;
    quantity: number;
    price_per_unit: number;
    total: number;
    customer_name: string;
    sale_date: string;
  }>;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/summary`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard summary');
    return response.json();
  }
}; 