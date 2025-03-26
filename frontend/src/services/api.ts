import axios from 'axios';
import { cacheManager } from '../utils/cacheStrategy';
import { handleApiError } from '../utils/errorHandling';
import { Purchase } from '../types/purchase';
import { Sale } from '../types/sale'; // Added import for Sale type

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => Promise.reject(handleApiError(error))
);

interface CacheOptions {
  cacheName?: string;
  maxAge?: number;
  bypassCache?: boolean;
}

export const apiWithCache = {
  async get<T>(url: string, options: CacheOptions = {}) {
    const {
      cacheName = 'api-cache',
      maxAge = 5 * 60 * 1000,
      bypassCache = false
    } = options;

    try {
      if (!bypassCache) {
        const cachedData = await cacheManager.get(cacheName, url);
        if (cachedData) return cachedData as T;
      }

      const response = await api.get<T>(url);
      await cacheManager.set(cacheName, url, response.data, maxAge);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async post<T>(url: string, data: any) {
    const response = await api.post<T>(url, data);
    return response.data;
  },

  async put<T>(url: string, data: any) {
    const response = await api.put<T>(url, data);
    return response.data;
  },

  async delete(url: string) {
    await api.delete(url);
  }
}; 

export const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// Update fetchPurchases to handle the actual API response format
export const fetchPurchases = async () => {
  try {
    const response = await api.get<Purchase[]>('/api/purchases');
    return response.data.map(purchase => ({
      ...purchase,
      // Ensure all required fields are present and properly formatted
      grain_name: decodeURIComponent(JSON.parse(`"${purchase.grain_name}"`)), // Handle Unicode characters
      number_of_bags: typeof purchase.number_of_bags === 'number' ? purchase.number_of_bags : parseInt(purchase.number_of_bags as any) || 0,
      weight_per_bag: typeof purchase.weight_per_bag === 'number' ? purchase.weight_per_bag : parseFloat(purchase.weight_per_bag as any) || 0,
      extra_weight: typeof purchase.extra_weight === 'number' ? purchase.extra_weight : parseFloat(purchase.extra_weight as any) || 0,
      total_weight: typeof purchase.total_weight === 'number' ? purchase.total_weight : parseFloat(purchase.total_weight as any) || 0,
      rate_per_kg: typeof purchase.rate_per_kg === 'number' ? purchase.rate_per_kg : parseFloat(purchase.rate_per_kg as any) || 0,
      total_amount: typeof purchase.total_amount === 'number' ? purchase.total_amount : parseFloat(purchase.total_amount as any) || 0,
      paid_amount: typeof purchase.paid_amount === 'number' ? purchase.paid_amount : parseFloat(purchase.paid_amount as any) || 0,
      payment_status: purchase.payment_status || 'pending'
    }));
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
};

// Purchase API functions
export const updatePurchase = async (id: number, data: Partial<Purchase>): Promise<Purchase> => {
  const response = await api.put<Purchase>(`/api/purchases/${id}`, data);
  return response.data;
};

export const deletePurchase = async (id: number) => {
  try {
    const response = await api.delete<{ message: string }>(`/api/purchases/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting purchase:', error);
    throw error;
  }
};

// Sales API functions
export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get<Sale[]>('/api/sales');
  return response.data;
};

export const createSale = async (data: Partial<Sale>): Promise<Sale> => {
  const response = await api.post<Sale>('/api/sales', data);
  return response.data;
};

export const updateSale = async (id: number, data: Partial<Sale>): Promise<Sale> => {
  const response = await api.put<Sale>(`/api/sales/${id}`, data);
  return response.data;
};

export const deleteSale = async (id: number): Promise<void> => {
  await api.delete(`/api/sales/${id}`);
};

// Export the api instance
export { api };