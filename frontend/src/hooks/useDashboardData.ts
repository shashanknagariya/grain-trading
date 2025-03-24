import { useState, useEffect } from 'react';
import { DashboardMetrics, DashboardChartData } from '../types/dashboard';

interface DashboardData {
  metrics: DashboardMetrics;
  chartData: DashboardChartData;
}

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<DashboardChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data: DashboardData = await response.json();
        setMetrics(data.metrics);
        setChartData(data.chartData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { metrics, chartData, isLoading, error };
};