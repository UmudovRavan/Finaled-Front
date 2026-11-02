import React from 'react';
import { PurchaseReceiptQuickFilters } from '../components/purchase-receipt/PurchaseReceiptQuickFilters';
import { PurchaseReceiptListView } from '../components/purchase-receipt/PurchaseReceiptListView';
import { PurchaseReceiptReportView } from '../components/purchase-receipt/PurchaseReceiptReportView';
import { PurchaseReceiptDashboardView } from '../components/purchase-receipt/PurchaseReceiptDashboardView';
import { PurchaseReceiptKanbanView } from '../components/purchase-receipt/PurchaseReceiptKanbanView';
import { AddPurchaseReceiptModal } from '../components/purchase-receipt/AddPurchaseReceiptModal';
import { PurchaseReceiptDetailModal } from '../components/purchase-receipt/PurchaseReceiptDetailModal';
import { usePurchaseReceipt } from '../context';

export const PurchaseReceiptPage: React.FC = () => {
  const { viewMode } = usePurchaseReceipt();

  return (
    <div className="space-y-3">
      {/* 1. Quick Filters Row (Image 1 & Image 2) */}
      <PurchaseReceiptQuickFilters />

      {/* 2. Main Selected View */}
      {viewMode === 'list' && <PurchaseReceiptListView />}
      {viewMode === 'report' && <PurchaseReceiptReportView />}
      {viewMode === 'dashboard' && <PurchaseReceiptDashboardView />}
      {viewMode === 'kanban' && <PurchaseReceiptKanbanView />}

      {/* 3. Interactive Modals */}
      <AddPurchaseReceiptModal />
      <PurchaseReceiptDetailModal />
    </div>
  );
};
