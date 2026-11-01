import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layout';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';
import { StockEntryPage } from '../pages/StockEntryPage';
import { NewStockEntryPage } from '../pages/NewStockEntryPage';
import { StockEntryDetailPage } from '../pages/StockEntryDetailPage';
import { WarehousesPage } from '../pages/WarehousesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { StockMovementsPage } from '../pages/StockMovementsPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Stock System Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Home Page (Images 2, 3, 4, 5) */}
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="warehouses" element={<WarehousesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="items" element={<ProductsPage />} />

          {/* Stock Transactions */}
          <Route path="stock-entry" element={<StockEntryPage />} />
          <Route path="stock-entry/new" element={<NewStockEntryPage />} />
          <Route path="stock-entry/new-stock-entry" element={<NewStockEntryPage />} />
          <Route path="stock-entry/:id" element={<StockEntryDetailPage />} />
          <Route path="purchase-receipt" element={<StockMovementsPage />} />
          <Route path="delivery-note" element={<StockMovementsPage />} />
          <Route path="material-request" element={<StockMovementsPage />} />
          <Route path="pick-list" element={<StockMovementsPage />} />
          <Route path="movements" element={<StockMovementsPage />} />

          {/* Suppliers, Tools & Reports */}
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="tools/*" element={<ProductsPage />} />
          <Route path="reports/*" element={<DashboardPage />} />
          <Route path="setup/*" element={<WarehousesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
