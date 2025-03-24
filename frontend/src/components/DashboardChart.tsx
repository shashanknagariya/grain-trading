import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DashboardChartData } from '../types/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartProps {
  data: DashboardChartData;
  labels: {
    sales: string;
    purchases: string;
    profit: string;
  };
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ data, labels }) => {
  if (!data) return null;

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: labels.sales,
        data: data.sales,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: labels.purchases,
        data: data.purchases,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: labels.profit,
        data: data.profit,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
    },
  };

  return <Line options={options} data={chartData} />;
};