import React, { Suspense } from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Grains } from './pages/Grains';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Purchases } from './pages/Purchases';
import { Sales } from './pages/Sales';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Users } from './pages/Users';
import { Godowns } from './pages/Godowns';
import { PurchaseDetailPage } from './pages/PurchaseDetail';
import { CreateSale } from './pages/CreateSale';
import './App.css';
import './styles/print.css';
import { NotificationProvider } from './contexts/NotificationContext';
import { CircularProgress } from '@mui/material';

const ProtectedRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return user ? element : <Navigate to="/login" />;
};

// Modify lazy imports to handle default exports correctly
const Dashboard = React.lazy(() => 
  import('./pages/Dashboard').then(module => ({
    default: module.Dashboard
  }))
);

const Inventory = React.lazy(() => 
  import('./pages/Inventory').then(module => ({
    default: module.Inventory
  }))
);

// Remove duplicate imports since we're using lazy loading
// and fix the import conflicts
const LazyPurchases = React.lazy(() => 
  import('./pages/Purchases').then(module => ({
    default: module.Purchases
  }))
);

const LazySales = React.lazy(() => 
  import('./pages/Sales').then(module => ({
    default: module.Sales
  }))
);

const LazyUsers = React.lazy(() => 
  import('./pages/Users').then(module => ({
    default: module.Users
  }))
);

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

const App: FC = () => {
  console.log('App component rendering');
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
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
        </NotificationProvider>
      </AuthProvider>
    </LocalizationProvider>
  );
};

export default App; 