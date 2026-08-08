import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { MainDashboard } from '../pages/MainDashboard';
import { InventoryPage } from '../pages/InventoryPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { ReplenishmentWorkbench } from '../pages/ReplenishmentWorkbench';
import { SuppliersPage } from '../pages/SuppliersPage';
import { ProcurementRequestsPage } from '../pages/ProcurementRequestsPage';
import { PurchaseOrdersPage } from '../pages/PurchaseOrdersPage';
import { GoodsReceivingPage } from '../pages/GoodsReceivingPage';
import { ForecastingPage } from '../pages/ForecastingPage';
import { RecommendationsPage } from '../pages/RecommendationsPage';
import { CopilotPage } from '../pages/CopilotPage';
import { FarmersPage } from '../pages/FarmersPage';
import { ReportsPage } from '../pages/ReportsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { UsersPage } from '../pages/UsersPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing & Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated Dashboard & Operations Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/items" element={<InventoryPage />} />
          <Route path="/inventory/items/:id" element={<ItemDetailPage />} />
          <Route path="/inventory/lots" element={<InventoryPage />} />
          <Route path="/inventory/movements" element={<InventoryPage />} />
          <Route path="/replenishment" element={<ReplenishmentWorkbench />} />
          <Route path="/purchase-planning" element={<ReplenishmentWorkbench />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/procurement" element={<ProcurementRequestsPage />} />
          <Route path="/procurement/requests" element={<ProcurementRequestsPage />} />
          <Route path="/procurement/orders" element={<PurchaseOrdersPage />} />
          <Route path="/receiving" element={<GoodsReceivingPage />} />
          <Route path="/forecasting" element={<ForecastingPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/farmers" element={<FarmersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute roles={['Administrator', 'Finance Reviewer']} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
