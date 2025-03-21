import { useState, useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
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

export const NotificationManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Listen for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'PUSH_NOTIFICATION') {
          handleNewNotification(event.data.notification);
        }
      });
    }
  }, []);

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [...prev, notification]);
    setCurrentNotification(notification);
    analytics.trackEvent({
      category: 'PWA',
      action: 'notification_received',
      label: notification.title
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action?.url) {
      window.location.href = notification.action.url;
    }
    markAsRead(notification.id);
    analytics.trackEvent({
      category: 'PWA',
      action: 'notification_clicked',
      label: notification.title
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <>
      <NotificationPrompt />
      <div className="notification-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <h4>{notification.title}</h4>
            <p>{notification.body}</p>
            {notification.action && (
              <Button size="small" color="primary">
                {notification.action.text}
              </Button>
            )}
          </div>
        ))}
      </div>
      <Snackbar
        open={!!currentNotification}
        autoHideDuration={6000}
        onClose={() => setCurrentNotification(null)}
      >
        <Alert 
          severity="info" 
          onClose={() => setCurrentNotification(null)}
          action={
            currentNotification?.action && (
              <Button 
                color="inherit" 
                size="small"
                onClick={() => handleNotificationClick(currentNotification)}
              >
                {currentNotification.action.text}
              </Button>
            )
          }
        >
          {currentNotification?.title}
        </Alert>
      </Snackbar>
    </>
  );
}; 