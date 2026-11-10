import React from 'react';
import { useLandedCostVoucher } from '../context';
import { LandedCostVoucherQuickFilters } from '../components/landed-cost-voucher/LandedCostVoucherQuickFilters';
import { LandedCostVoucherListView } from '../components/landed-cost-voucher/LandedCostVoucherListView';
import { LandedCostVoucherReportView } from '../components/landed-cost-voucher/LandedCostVoucherReportView';
import { LandedCostVoucherDashboardView } from '../components/landed-cost-voucher/LandedCostVoucherDashboardView';
import { LandedCostVoucherKanbanView } from '../components/landed-cost-voucher/LandedCostVoucherKanbanView';

export const LandedCostVoucherPage: React.FC = () => {
  const { viewMode } = useLandedCostVoucher();

  return (
    <div className="space-y-3">
      <LandedCostVoucherQuickFilters />

      {viewMode === 'list' && <LandedCostVoucherListView />}
      {viewMode === 'report' && <LandedCostVoucherReportView />}
      {viewMode === 'dashboard' && <LandedCostVoucherDashboardView />}
      {viewMode === 'kanban' && <LandedCostVoucherKanbanView />}
    </div>
  );
};

export default LandedCostVoucherPage;

