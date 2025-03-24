import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export interface DashboardMetrics {
  totalSales: number;
  totalPurchases: number;
  inventory: number;
}

export const useDashboardData = () => {
  const { showError } = useNotification();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/metrics`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }
        const data = await response.json();
        setMetrics(data.metrics);
        setChartData(data.chartData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        showError(errorMessage);
        setError(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showError]);

  return { metrics, chartData, isLoading, error };
};