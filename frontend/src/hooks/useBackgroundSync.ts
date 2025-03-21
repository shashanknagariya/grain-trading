import { useEffect, useCallback } from 'react';
import { backgroundSync } from '../utils/backgroundSync';

export const useBackgroundSync = () => {
  useEffect(() => {
    const handleSync = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_COMPLETED') {
        // Handle sync completion
        console.log('Sync completed for:', event.data.payload);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSync);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSync);
    };
  }, []);

  const queueSync = useCallback(async (request: {
    url: string;
    method: string;
    data: any;
  }) => {
    await backgroundSync.addToSyncQueue(request);
  }, []);

  return { queueSync };
}; 