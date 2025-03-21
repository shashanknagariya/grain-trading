import { useOfflineStorage } from '../../hooks/useOfflineStorage';

export const PurchaseForm = () => {
  const { addItem, error } = useOfflineStorage('purchases');

  const handleSubmit = async (formData) => {
    try {
      // This will store locally and queue for sync
      await addItem({
        id: Date.now(), // temporary ID
        ...formData,
        date: new Date().toISOString()
      });
      
      // Show success message
    } catch (err) {
      // Handle error
    }
  };

  // ... rest of the component
}; 