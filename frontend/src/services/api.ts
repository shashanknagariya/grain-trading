import axios from 'axios';
import { cacheManager } from '../utils/cacheStrategy';
import { handleApiError } from '../utils/errorHandling';
import { Purchase } from '../types/purchase';
import { Sale } from '../types/sale';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  withCredentials: true, // Enable sending cookies
  headers: {
    'Content-Type': 'application/json'
  }
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

// Purchase API functions
export const fetchPurchases = async () => {
  try {
    const response = await api.get('/api/purchases');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createPurchase = async (data: Partial<Purchase>) => {
  try {
    const response = await api.post('/api/purchases', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updatePurchase = async (id: number, data: Partial<Purchase>) => {
  try {
    const response = await api.put(`/api/purchases/${id}`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deletePurchase = async (id: number) => {
  try {
    await api.delete(`/api/purchases/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Sales API functions
export const getSales = async () => {
  try {
    const response = await api.get('/api/sales');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createSale = async (data: Partial<Sale>) => {
  try {
    const response = await api.post('/api/sales', data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateSale = async (id: number, data: Partial<Sale>) => {
  try {
    const response = await api.put(`/api/sales/${id}`, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteSale = async (id: number) => {
  try {
    await api.delete(`/api/sales/${id}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Export the api instance
export { api };