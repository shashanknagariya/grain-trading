import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Only register service worker in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Wait until the page is fully loaded
  window.addEventListener('load', async () => {
    try {
      // First check if manifest exists
      const manifestResponse = await fetch('/manifest.json');
      if (!manifestResponse.ok) {
        throw new Error('Manifest not found');
      }

      // Then try to register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('SW registered:', registration);
    } catch (error) {
      console.log('SW or manifest error:', error);
      // Don't keep retrying if there's an error
      return;
    }
  });
}