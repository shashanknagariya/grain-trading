import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationState {
  previousRoute: string | null;
  currentRoute: string;
  navigationHistory: string[];
  lastVisitedRoutes: Record<string, string>;
}

export const useNavigationState = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<NavigationState>({
    previousRoute: null,
    currentRoute: location.pathname,
    navigationHistory: [location.pathname],
    lastVisitedRoutes: JSON.parse(localStorage.getItem('lastVisitedRoutes') || '{}')
  });

  useEffect(() => {
    if (location.pathname !== state.currentRoute) {
      setState(prev => {
        const newHistory = [...prev.navigationHistory, location.pathname].slice(-5);
        const newLastVisited = {
          ...prev.lastVisitedRoutes,
          [location.pathname]: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('lastVisitedRoutes', JSON.stringify(newLastVisited));

        return {
          previousRoute: prev.currentRoute,
          currentRoute: location.pathname,
          navigationHistory: newHistory,
          lastVisitedRoutes: newLastVisited
        };
      });
    }
  }, [location.pathname]);

  const goBack = () => {
    if (state.previousRoute) {
      navigate(state.previousRoute);
    } else {
      navigate('/');
    }
  };

  const getLastVisited = (route: string) => {
    return state.lastVisitedRoutes[route] || null;
  };

  return {
    currentRoute: state.currentRoute,
    previousRoute: state.previousRoute,
    navigationHistory: state.navigationHistory,
    lastVisitedRoutes: state.lastVisitedRoutes,
    goBack,
    getLastVisited
  };
}; 