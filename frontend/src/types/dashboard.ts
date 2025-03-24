export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  activeGrains: number;
  totalGodowns: number;
  totalSales: number;
  totalPurchases: number;
  inventory: number;
}

export interface DashboardChartData {
  labels: string[];
  sales: number[];
  purchases: number[];
  profit: number[];
}

export interface DashboardChartProps {
  data: DashboardChartData;
  labels: {
    sales: string;
    purchases: string;
    profit: string;
  };
}

export type CardType = 'currency' | 'number' | 'sale' | 'purchase' | 'user';
