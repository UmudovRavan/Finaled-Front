import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AppLayout } from '../layout';
import {
    Login,
    ForgotPassword,
    ResetPassword,
    Dashboard,
    MasterDataPage,
    AccountsPage,
    AccountDetailPage,
    JournalPage,
    JournalDetailPage,
    SalesOrdersPage,
    SalesOrderDetailPage,
    DeliveryNotesPage,
    DeliveryNoteDetailPage,
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
    FinancialPositionPage,
    ProfitOrLossPage,
    ChangesInEquityPage,
    CashFlowPage,
    ReconciliationPage,
    FiscalPeriodsPage,
    CompanyPage,
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

                    {/* Master Data Hub */}
                    <Route path="/master-data" element={<MasterDataPage />} />

                    {/* General Ledger */}
                    <Route path="/accounts" element={<AccountsPage />} />
                    <Route path="/accounts/:id" element={<AccountDetailPage />} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/journal/:id" element={<JournalDetailPage />} />

                    {/* Sales Cycle */}
                    <Route path="/sales/orders" element={<SalesOrdersPage />} />
                    <Route path="/sales/orders/:id" element={<SalesOrderDetailPage />} />
                    <Route path="/sales/deliveries" element={<DeliveryNotesPage />} />
                    <Route path="/sales/deliveries/:id" element={<DeliveryNoteDetailPage />} />
                    <Route path="/customers" element={<Navigate to="/master-data?tab=customers" replace />} />
                    <Route path="/customers/:id" element={<CustomerDetailPage />} />
                    <Route path="/customer-invoices" element={<CustomerInvoicesPage />} />
                    <Route path="/customer-invoices/:id" element={<CustomerInvoiceDetailPage />} />
                    <Route path="/items" element={<Navigate to="/master-data?tab=items" replace />} />
                    <Route path="/items/:id" element={<ItemDetailPage />} />

                    {/* Procurement & AP */}
                    <Route path="/suppliers" element={<Navigate to="/master-data?tab=suppliers" replace />} />
                    <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
                    <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                    <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
                    <Route path="/goods-receipts" element={<GoodsReceiptsPage />} />
                    <Route path="/goods-receipts/:id" element={<GoodsReceiptDetailPage />} />
                    <Route path="/supplier-invoices" element={<SupplierInvoicesPage />} />
                    <Route path="/supplier-invoices/:id" element={<SupplierInvoiceDetailPage />} />

                    {/* Inventory */}
                    <Route path="/warehouses" element={<Navigate to="/master-data?tab=warehouses" replace />} />
                    <Route path="/warehouses/:id" element={<WarehouseDetailPage />} />
                    <Route path="/stock-ledger" element={<StockLedgerPage />} />
                    <Route path="/stock-ledger/:id" element={<StockTransactionDetailPage />} />
                    <Route path="/stock-transactions/:id" element={<StockTransactionDetailPage />} />

                    {/* Treasury */}
                    <Route path="/bank-accounts" element={<Navigate to="/master-data?tab=bankAccounts" replace />} />
                    <Route path="/bank-accounts/:id" element={<BankAccountDetailPage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/payments/:id" element={<PaymentDetailPage />} />
                    <Route path="/payment-runs" element={<PaymentRunsPage />} />

                    {/* Financial Reports */}
                    <Route path="/reports" element={<Navigate to="/reports/trial-balance" replace />} />
                    <Route path="/reports/trial-balance" element={<TrialBalancePage />} />
                    <Route path="/reports/financial-position" element={<FinancialPositionPage />} />
                    <Route path="/reports/profit-or-loss" element={<ProfitOrLossPage />} />
                    <Route path="/reports/changes-in-equity" element={<ChangesInEquityPage />} />
                    <Route path="/reports/cash-flow" element={<CashFlowPage />} />
                    <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
                    <Route path="/reports/income-statement" element={<IncomeStatementPage />} />
                    <Route path="/reports/aging" element={<AgingPage />} />
                    <Route path="/aging" element={<Navigate to="/reports/aging" replace />} />

                    {/* Period Close */}
                    <Route path="/reconciliation" element={<ReconciliationPage />} />
                    <Route path="/fiscal-periods" element={<FiscalPeriodsPage />} />

                    {/* Settings & Company */}
                    <Route path="/company" element={<CompanyPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRouter;
