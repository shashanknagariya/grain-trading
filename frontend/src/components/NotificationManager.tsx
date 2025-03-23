import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { NotificationPrompt } from './NotificationPrompt';
import { analytics } from '../utils/analytics';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  action?: {
    text: string;
    url: string;
  };
}

export const NotificationManager: React.FC = () => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent<any>) => {
        if (event.data?.type === 'PUSH_NOTIFICATION') {
          handleNewNotification(event.data.notification);
        }
      });
    }
  }, []);

  const handleNewNotification = (notification: Notification) => {
    setCurrentNotification(notification);
    analytics.trackEvent({
      type: 'notification',
      category: 'PWA',
      action: 'notification_received',
      label: notification.title
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action?.url) {
      window.location.href = notification.action.url;
    }
    analytics.trackEvent({
      type: 'notification',
      category: 'PWA',
      action: 'notification_clicked',
      label: notification.title
    });
  };

  return (
    <>
      <NotificationPrompt />
      <Snackbar
        open={!!currentNotification}
        autoHideDuration={6000}
        onClose={() => setCurrentNotification(null)}
      >
        <Alert 
          severity="info" 
          onClose={() => setCurrentNotification(null)}
          onClick={() => currentNotification && handleNotificationClick(currentNotification)}
          sx={{ cursor: 'pointer' }}
        >
          {currentNotification?.title}
        </Alert>
      </Snackbar>
    </>
  );
}; 