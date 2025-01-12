import React from 'react';
import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
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

const ProtectedRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return user ? element : <Navigate to="/login" />;
};

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
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/purchases" element={<Purchases />} />
                          <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
                          <Route path="/sales" element={<Sales />} />
                          <Route path="/sales/new" element={<CreateSale />} />
                          <Route path="/inventory" element={<Inventory />} />
                          <Route path="/grains" element={<Grains />} />
                          <Route path="/godowns" element={<Godowns />} />
                          <Route path="/users" element={<Users />} />
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