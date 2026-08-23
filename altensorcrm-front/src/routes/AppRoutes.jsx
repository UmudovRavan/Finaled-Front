import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CrmLayout from '../layouts/CrmLayout';
import CrmDashboardPage from '../pages/crm/CrmDashboardPage';
import LeadsPage from '../pages/crm/LeadsPage';
import LeadDetailPage from '../pages/crm/LeadDetailPage';
import DealsPage from '../pages/crm/DealsPage';
import DealDetailPage from '../pages/crm/DealDetailPage';
import ContactsPage from '../pages/crm/ContactsPage';
import ContactDetailPage from '../pages/crm/ContactDetailPage';
import OrganizationsPage from '../pages/crm/OrganizationsPage';
import OrganizationDetailPage from '../pages/crm/OrganizationDetailPage';
import NotesPage from '../pages/crm/NotesPage';
import TasksPage from '../pages/crm/TasksPage';
import CallLogsPage from '../pages/crm/CallLogsPage';
import NotificationsPage from '../pages/crm/NotificationsPage';
import SettingsPage from '../pages/crm/SettingsPage';

const PageTitleHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path.startsWith('/crm/leads/')) {
      document.title = 'Altensor CRM - Lead Details';
    } else if (path === '/crm/leads') {
      document.title = 'Altensor CRM - Leads';
    } else if (path.startsWith('/crm/deals/')) {
      document.title = 'Altensor CRM - Deal Details';
    } else if (path === '/crm/deals') {
      document.title = 'Altensor CRM - Deals';
    } else if (path.startsWith('/crm/contacts/')) {
      document.title = 'Altensor CRM - Contact Details';
    } else if (path === '/crm/contacts') {
      document.title = 'Altensor CRM - Contacts';
    } else if (path.startsWith('/crm/organizations/')) {
      document.title = 'Altensor CRM - Organization Details';
    } else if (path === '/crm/organizations') {
      document.title = 'Altensor CRM - Organizations';
    } else if (path === '/crm/dashboard' || path === '/dashboard' || path === '/') {
      document.title = 'Altensor CRM - Dashboard';
    } else if (path === '/crm/notes') {
      document.title = 'Altensor CRM - Notes';
    } else if (path === '/crm/tasks' || path === '/tasks') {
      document.title = 'Altensor CRM - Tasks';
    } else if (path === '/crm/call-logs') {
      document.title = 'Altensor CRM - Call Logs';
    } else if (path === '/crm/notifications') {
      document.title = 'Altensor CRM - Notifications';
    } else if (path === '/crm/settings') {
      document.title = 'Altensor CRM - Settings';
    } else {
      document.title = 'Altensor CRM';
    }
  }, [location.pathname]);

  return null;
};

export const AppRoutes = () => {
  return (
    <>
      <PageTitleHandler />
      <Routes>
        {/* Direct Root & Aliases redirected to CRM Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/crm/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/crm/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Navigate to="/crm/tasks" replace />
            </ProtectedRoute>
          }
        />

        {/* Altensor CRM Module Routes */}
        <Route
          path="/crm"
          element={
            <ProtectedRoute>
              <CrmLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/crm/dashboard" replace />} />
          <Route path="notifications" element={<Navigate to="/crm/dashboard" replace />} />
          <Route path="dashboard" element={<CrmDashboardPage />} />
          <Route
            path="leads"
            element={
              <ProtectedRoute requiredPermission="crm.leads.view">
                <LeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="leads/:id"
            element={
              <ProtectedRoute requiredPermission="crm.leads.view">
                <LeadDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="deals"
            element={
              <ProtectedRoute requiredPermission="crm.deals.view">
                <DealsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="deals/:id"
            element={
              <ProtectedRoute requiredPermission="crm.deals.view">
                <DealDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="contacts"
            element={
              <ProtectedRoute requiredPermission="crm.contacts.view">
                <ContactsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="contacts/:id"
            element={
              <ProtectedRoute requiredPermission="crm.contacts.view">
                <ContactDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizations"
            element={
              <ProtectedRoute requiredPermission="crm.organizations.view">
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizations/:id"
            element={
              <ProtectedRoute requiredPermission="crm.organizations.view">
                <OrganizationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notes"
            element={
              <ProtectedRoute requiredPermission="crm.notes.view">
                <NotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="tasks"
            element={
              <ProtectedRoute requiredPermission="crm.tasks.view">
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route path="call-logs" element={<CallLogsPage />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute requiredPermission="crm.settings.manage">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all redirect to CRM Dashboard */}
        <Route path="*" element={<Navigate to="/crm/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
