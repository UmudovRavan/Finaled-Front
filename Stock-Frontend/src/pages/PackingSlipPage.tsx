import React from 'react';
import { usePackingSlip } from '../context';
import {
  PackingSlipQuickFilters,
  PackingSlipListView,
  PackingSlipReportView,
  PackingSlipDashboardView,
  PackingSlipKanbanView,
} from '../components/packing-slip';

export const PackingSlipPage: React.FC = () => {
  const { viewMode } = usePackingSlip();

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <PackingSlipQuickFilters />

      {/* Dynamic View rendering */}
      {viewMode === 'list' && <PackingSlipListView />}
      {viewMode === 'report' && <PackingSlipReportView />}
      {viewMode === 'dashboard' && <PackingSlipDashboardView />}
      {viewMode === 'kanban' && <PackingSlipKanbanView />}
    </div>
  );
};

export default PackingSlipPage;

