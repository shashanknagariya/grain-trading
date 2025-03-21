import { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { subscribeToPushNotifications } from '../utils/pushNotifications';

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async () => {
    try {
      await subscribeToPushNotifications();
      setStatus('success');
      setMessage('Successfully subscribed to notifications!');
      setShowPrompt(false);
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe to notifications. Please try again.');
    }
  };

  if (!showPrompt) return null;

  return (
    <>
      <div className="notification-prompt">
        <p>Stay updated with push notifications</p>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubscribe}
        >
          Enable Notifications
        </Button>
      </div>
      <Snackbar 
        open={status !== 'idle'} 
        autoHideDuration={6000} 
        onClose={() => setStatus('idle')}
      >
        <Alert severity={status === 'success' ? 'success' : 'error'}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}; 