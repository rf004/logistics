import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Shipments from './pages/Shipments';
import Warehouses from './pages/Warehouses';
import Trucks from './pages/Trucks';
import Roads from './pages/Roads';
import RoutesPage from './pages/Routes';
import TransportPlans from './pages/TransportPlans';
import TransportPlanDetails from './pages/TransportPlanDetails';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Main App Layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/farms" element={<Farms />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/trucks" element={<Trucks />} />
            <Route path="/fleet" element={<Navigate to="/trucks" replace />} />
            <Route path="/roads" element={<Roads />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/transport-plans" element={<TransportPlans />} />
            <Route path="/transport-plans/:id" element={<TransportPlanDetails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
