import React, { Suspense } from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Grains } from './pages/Grains';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Godowns } from './pages/Godowns';
import { PurchaseDetailPage } from './pages/PurchaseDetail';
import { CreateSale } from './pages/CreateSale';
import './App.css';
import './styles/print.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { CircularProgress } from '@mui/material';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { optimizedLazy } from './utils/loadingOptimization.tsx';
import { SnackbarProvider } from 'notistack';
import './i18n/config'; // Import i18n configuration

const ProtectedRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return user ? element : <Navigate to="/login" />;
};

// Lazy loaded components
const Dashboard = optimizedLazy(() => 
  import('./pages/Dashboard').then(module => ({
    default: module.Dashboard
  }))
);

const Inventory = optimizedLazy(() => 
  import('./pages/Inventory').then(module => ({
    default: module.Inventory
  }))
);

const LazyPurchases = optimizedLazy(() => 
  import('./pages/Purchases').then(module => ({
    default: module.Purchases
  }))
);

const LazySales = optimizedLazy(() => 
  import('./pages/Sales').then(module => ({
    default: module.Sales
  }))
);

const LazyUsers = optimizedLazy(() => 
  import('./pages/Users').then(module => ({
    default: module.Users
  }))
);

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <NotificationProvider>
            <SnackbarProvider maxSnack={3}>
              <PWAInstallPrompt />
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute
                        element={
                          <Layout>
                            <Routes>
                              <Route path="/" element={<Navigate to="/dashboard" />} />
                              <Route path="/dashboard" element={
                                <Suspense fallback={<LoadingFallback />}>
                                  <Dashboard />
                                </Suspense>
                              } />
                              <Route path="/purchases" element={
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyPurchases />
                                </Suspense>
                              } />
                              <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
                              <Route path="/sales" element={
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazySales />
                                </Suspense>
                              } />
                              <Route path="/sales/new" element={<CreateSale />} />
                              <Route path="/inventory" element={
                                <Suspense fallback={<LoadingFallback />}>
                                  <Inventory />
                                </Suspense>
                              } />
                              <Route path="/grains" element={<Grains />} />
                              <Route path="/godowns" element={<Godowns />} />
                              <Route path="/users" element={
                                <Suspense fallback={<LoadingFallback />}>
                                  <LazyUsers />
                                </Suspense>
                              } />
                            </Routes>
                          </Layout>
                        }
                      />
                    }
                  />
                </Routes>
              </Router>
            </SnackbarProvider>
          </NotificationProvider>
        </AuthProvider>
      </LocalizationProvider>
    </Suspense>
  );
};

export default App;