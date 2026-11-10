import React from 'react';
import { useItem } from '../context';
import {
  ItemQuickFilters,
  ItemListView,
  NewItemModal,
  ItemReportView,
  ItemDashboardView,
  ItemKanbanView,
} from '../components/item';

export const ItemPage: React.FC = () => {
  const { viewMode } = useItem();

  return (
    <div className="space-y-3">
      {/* Quick Filters toolbar */}
      <ItemQuickFilters />

      {/* Main Content Area based on View Mode */}
      {viewMode === 'list' && <ItemListView />}
      {viewMode === 'report' && <ItemReportView />}
      {viewMode === 'dashboard' && <ItemDashboardView />}
      {viewMode === 'kanban' && <ItemKanbanView />}

      {/* Add Item Modal */}
      <NewItemModal />
    </div>
  );
};

export default ItemPage;

