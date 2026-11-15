import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

interface ProtectedRouteProps {
  requiredPermission?: string;
  requiredRole?: string;
  requiredModule?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  requiredRole,
  requiredModule,
}) => {
  const { isAuthenticated, authChecked, hasPermission, hasRole, hasModule } = useAuth();
  const location = useLocation();

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredModule && !hasModule(requiredModule) && !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Modula icazə yoxdur</h2>
          <p className="text-xs text-slate-500">Bu modula giriş üçün aktiv abunəlik və ya icazə tələb olunur.</p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Giriş icazəsi yoxdur</h2>
          <p className="text-xs text-slate-500">Bu bölməyə daxil olmaq üçün tələb olunan rolunuz yoxdur.</p>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission) && !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">İcazə məhdudiyyəti</h2>
          <p className="text-xs text-slate-500">Bu əməliyyat üçün tələb olunan icazəniz yoxdur.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
