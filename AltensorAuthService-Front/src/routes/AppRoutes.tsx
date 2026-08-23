import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import TenantsPage from '../pages/TenantsPage';
import TenantDetailPage from '../pages/TenantDetailPage';
import RolesPage from '../pages/RolesPage';
import UsersPage from '../pages/UsersPage';
import SecurityJwksPage from '../pages/SecurityJwksPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Shell Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* SuperAdmin Only Tenant Routes */}
        <Route
          path="tenants"
          element={
            <ProtectedRoute requireSuperAdmin>
              <TenantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tenants/:id"
          element={
            <ProtectedRoute requireSuperAdmin>
              <TenantDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="permissions" element={<RolesPage />} />
        <Route
          path="security"
          element={
            <ProtectedRoute requireSuperAdmin>
              <SecurityJwksPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
