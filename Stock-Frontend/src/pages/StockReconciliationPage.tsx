import React from 'react';
import { useStockReconciliation } from '../context';
import { StockReconciliationQuickFilters } from '../components/stock-reconciliation/StockReconciliationQuickFilters';
import { StockReconciliationListView } from '../components/stock-reconciliation/StockReconciliationListView';
import { StockReconciliationReportView } from '../components/stock-reconciliation/StockReconciliationReportView';
import { StockReconciliationDashboardView } from '../components/stock-reconciliation/StockReconciliationDashboardView';
import { StockReconciliationKanbanView } from '../components/stock-reconciliation/StockReconciliationKanbanView';

export const StockReconciliationPage: React.FC = () => {
  const { viewMode } = useStockReconciliation();

  return (
    <div className="space-y-3">
      <StockReconciliationQuickFilters />

      {viewMode === 'list' && <StockReconciliationListView />}
      {viewMode === 'report' && <StockReconciliationReportView />}
      {viewMode === 'dashboard' && <StockReconciliationDashboardView />}
      {viewMode === 'kanban' && <StockReconciliationKanbanView />}
    </div>
  );
};

export default StockReconciliationPage;

