import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AppLayout } from '../layout';
import {
    Login,
    ForgotPassword,
    ResetPassword,
    Dashboard,
    AccountsPage,
    AccountDetailPage,
    JournalPage,
    JournalDetailPage,
    CustomersPage,
    CustomerDetailPage,
    CustomerInvoicesPage,
    CustomerInvoiceDetailPage,
    ItemsPage,
    ItemDetailPage,
    SuppliersPage,
    SupplierDetailPage,
    PurchaseOrdersPage,
    PurchaseOrderDetailPage,
    GoodsReceiptsPage,
    GoodsReceiptDetailPage,
    SupplierInvoicesPage,
    SupplierInvoiceDetailPage,
    WarehousesPage,
    WarehouseDetailPage,
    StockLedgerPage,
    StockTransactionDetailPage,
    BankAccountsPage,
    BankAccountDetailPage,
    PaymentsPage,
    PaymentDetailPage,
    PaymentRunsPage,
    TrialBalancePage,
    BalanceSheetPage,
    IncomeStatementPage,
    AgingPage,
    ReconciliationPage,
    FiscalPeriodsPage,
    SettingsPage,
} from '../pages';

export const AppRouter: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes inside AppLayout */}
            <Route element={<ProtectedRoute requiredModule="accounting" />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* General Ledger */}
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/accounts/:id" element={<AccountDetailPage />} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/journal/:id" element={<JournalDetailPage />} />

                    {/* Sales & AR */}
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/:id" element={<CustomerDetailPage />} />
                    <Route path="/customer-invoices" element={<CustomerInvoicesPage />} />
                    <Route path="/customer-invoices/:id" element={<CustomerInvoiceDetailPage />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/items/:id" element={<ItemDetailPage />} />

                    {/* Procurement & AP */}
                    <Route path="/suppliers" element={<SuppliersPage />} />
                    <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
                    <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                    <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                    <Route path="/goods-receipts" element={<GoodsReceiptsPage />} />
                    <Route path="/goods-receipts/:id" element={<GoodsReceiptDetailPage />} />
                    <Route path="/supplier-invoices" element={<SupplierInvoicesPage />} />
                    <Route path="/supplier-invoices/:id" element={<SupplierInvoiceDetailPage />} />

                    {/* Inventory */}
                    <Route path="/warehouses" element={<WarehousesPage />} />
                    <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
                    <Route path="/stock-ledger" element={<StockLedgerPage />} />
                    <Route path="/stock-ledger/:id" element={<StockTransactionDetailPage />} />
                    <Route path="/stock-transactions/:id" element={<StockTransactionDetailPage />} />

                    {/* Treasury */}
                    <Route path="/bank-accounts" element={<BankAccountsPage />} />
                    <Route path="/bank-accounts/:id" element={<BankAccountDetailPage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/payments/:id" element={<PaymentDetailPage />} />
                    <Route path="/payment-runs" element={<PaymentRunsPage />} />

                    {/* Reports */}
                    <Route path="/reports/trial-balance" element={<TrialBalancePage />} />
                    <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
                    <Route path="/reports/income-statement" element={<IncomeStatementPage />} />
                    <Route path="/reports/aging" element={<AgingPage />} />
                    <Route path="/aging" element={<Navigate to="/reports/aging" replace />} />

                    {/* Period Close */}
                    <Route path="/reconciliation" element={<ReconciliationPage />} />
                    <Route path="/fiscal-periods" element={<FiscalPeriodsPage />} />

                    {/* Settings */}
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRouter;
