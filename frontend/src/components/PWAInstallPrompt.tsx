import React, { useEffect, useState } from 'react';
import { Button, Snackbar } from '@mui/material';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowPrompt(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  return (
    <Snackbar
      open={showPrompt}
      message="Install this app on your device"
      action={
        <Button color="primary" size="small" onClick={handleInstallClick}>
          Install
        </Button>
      }
    />
  );
}; 