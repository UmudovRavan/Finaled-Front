import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import CrmProductPage from '../pages/CrmProductPage';
import TaskProductPage from '../pages/TaskProductPage';
import ProductsOverviewPage from '../pages/ProductsOverviewPage';
import BlogPage from '../pages/BlogPage';
import BlogPostPage from '../pages/BlogPostPage';
import LoginPage from '../pages/LoginPage';
import DesktopPage from '../pages/DesktopPage';

const PageTitleHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path === '/') {
      document.title = 'Altensor - Intelligent Editorial Systems';
    } else if (path === '/about') {
      document.title = 'Altensor - About & Principles';
    } else if (path === '/crm' || path === '/product/crm') {
      document.title = 'Altensor CRM - Sales Pipeline & Client Management';
    } else if (path === '/tasks' || path === '/product/tasks' || path === '/products/tasks') {
      document.title = 'Altensor - Task & Project Management';
    } else if (path === '/product' || path === '/products') {
      document.title = 'Altensor - Enterprise Product Ecosystem';
    } else if (path === '/blog') {
      document.title = 'Altensor - Blog';
    } else if (path.startsWith('/blog/')) {
      document.title = 'Altensor - Blog Article';
    } else if (path === '/login') {
      document.title = 'Altensor - Sign In';
    } else if (path === '/desktop' || path === '/workspace') {
      document.title = 'Altensor - Desktop';
    } else {
      document.title = 'Altensor';
    }
  }, [location.pathname]);

  return null;
};

export const AppRoutes = () => {
  return (
    <>
      <PageTitleHandler />
      <Routes>
        {/* Public Information Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/crm" element={<CrmProductPage />} />
        <Route path="/product/crm" element={<CrmProductPage />} />
        <Route path="/products/crm" element={<CrmProductPage />} />
        <Route path="/tasks" element={<TaskProductPage />} />
        <Route path="/product/tasks" element={<TaskProductPage />} />
        <Route path="/products/tasks" element={<TaskProductPage />} />
        <Route path="/product" element={<ProductsOverviewPage />} />
        <Route path="/products" element={<ProductsOverviewPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Enterprise Workspace Desktop / Launchpad */}
        <Route
          path="/desktop"
          element={
            <ProtectedRoute>
              <DesktopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace"
          element={
            <ProtectedRoute>
              <DesktopPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
