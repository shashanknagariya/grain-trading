import { useState, useEffect } from 'react';
import { dbService } from '../utils/indexedDB';

export const useOfflineStorage = (storeName) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    initializeDB();
  }, []);

  const initializeDB = async () => {
    try {
      await dbService.initDB();
      const storedData = await dbService.getAll(storeName);
      setData(storedData);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item) => {
    try {
      await dbService.add(storeName, item);
      // Also add to pending transactions for later sync
      await dbService.addPendingTransaction({
        type: storeName,
        data: item
      });
      // Update local state
      setData(prev => [...prev, item]);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateItem = async (item) => {
    try {
      await dbService.update(storeName, item);
      // Update local state
      setData(prev => prev.map(i => i.id === item.id ? item : i));
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      await dbService.delete(storeName, id);
      // Update local state
      setData(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    data,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem
  };
}; 