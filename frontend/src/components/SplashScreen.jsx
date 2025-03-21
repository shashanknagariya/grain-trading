import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';

export const SplashScreen = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="splash-screen">
      <img src={logo} alt="App Logo" className="splash-logo" />
      <div className="splash-loading">Loading...</div>
    </div>
  );
}; 