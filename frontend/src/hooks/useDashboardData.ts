import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface DashboardData {
  totalPurchases: number;
  totalSales: number;
  totalInventory: number;
  totalRevenue: number;
  recentPurchases: Array<{
    id: number;
    billNumber: string;
    supplierName: string;
    amount: number;
    date: string;
  }>;
  recentSales: Array<{
    id: number;
    billNumber: string;
    buyerName: string;
    amount: number;
    date: string;
  }>;
  inventorySummary: Array<{
    grainId: number;
    totalBags: number;
  }>;
}

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<DashboardData>('/api/metrics');
        setMetrics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { metrics, isLoading, error };
};