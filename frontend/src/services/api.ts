import axios from 'axios';
import { cacheManager } from '../utils/cacheStrategy';
import { handleApiError } from '../utils/errorHandling';
import { Purchase } from '../types/purchase';

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

export const fetchPurchases = async () => {
  return await apiWithCache.get<Purchase[]>('/api/purchases');
};