
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import BuyersPage from './pages/BuyersPage';
import ProductsPage from './pages/ProductsPage';
import BillingPage from './pages/BillingPage';
import ReportsPage from './pages/ReportsPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

const AppLoadingSpinner: React.FC = () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const Main: React.FC = () => {
  const { isInitialized, isAuthenticated } = useAppContext();

  if (!isInitialized) {
      return <AppLoadingSpinner />;
  }

  return (
    <HashRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="buyers" element={<BuyersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;