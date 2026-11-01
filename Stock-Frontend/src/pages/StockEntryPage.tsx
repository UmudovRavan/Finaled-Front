import React from 'react';
import { StockEntryQuickFilters } from '../components/stock-entry/StockEntryQuickFilters';
import { StockEntryListView } from '../components/stock-entry/StockEntryListView';
import { StockEntryReportView } from '../components/stock-entry/StockEntryReportView';
import { StockEntryDashboardView } from '../components/stock-entry/StockEntryDashboardView';
import { StockEntryKanbanView } from '../components/stock-entry/StockEntryKanbanView';
import { AddStockEntryModal } from '../components/stock-entry/AddStockEntryModal';
import { StockEntryDetailModal } from '../components/stock-entry/StockEntryDetailModal';
import { useStockEntry } from '../context';

export const StockEntryPage: React.FC = () => {
  const { viewMode } = useStockEntry();

  return (
    <div className="space-y-3">
      {/* 1. Quick Filters Row (Image 1, 4, 5) */}
      <StockEntryQuickFilters />

      {/* 2. Main Selected View */}
      {viewMode === 'list' && <StockEntryListView />}
      {viewMode === 'report' && <StockEntryReportView />}
      {viewMode === 'dashboard' && <StockEntryDashboardView />}
      {viewMode === 'kanban' && <StockEntryKanbanView />}

      {/* 3. Interactive Modals */}
      <AddStockEntryModal />
      <StockEntryDetailModal />
    </div>
  );
};

