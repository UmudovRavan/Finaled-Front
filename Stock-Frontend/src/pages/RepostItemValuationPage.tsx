import React from 'react';
import { useRepostItemValuation } from '../context';
import {
  RepostItemValuationQuickFilters,
  RepostItemValuationListView,
  RepostItemValuationReportView,
  RepostItemValuationDashboardView,
  RepostItemValuationKanbanView,
} from '../components/repost-item-valuation';

export const RepostItemValuationPage: React.FC = () => {
  const { viewMode } = useRepostItemValuation();

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <RepostItemValuationQuickFilters />

      {/* Dynamic View rendering */}
      {viewMode === 'list' && <RepostItemValuationListView />}
      {viewMode === 'report' && <RepostItemValuationReportView />}
      {viewMode === 'dashboard' && <RepostItemValuationDashboardView />}
      {viewMode === 'kanban' && <RepostItemValuationKanbanView />}
    </div>
  );
};

export default RepostItemValuationPage;
