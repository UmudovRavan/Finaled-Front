import React from 'react';
import { usePickList } from '../context';
import { PickListQuickFilters } from '../components/pick-list/PickListQuickFilters';
import { PickListListView } from '../components/pick-list/PickListListView';
import { PickListReportView } from '../components/pick-list/PickListReportView';
import { PickListDashboardView } from '../components/pick-list/PickListDashboardView';
import { PickListKanbanView } from '../components/pick-list/PickListKanbanView';

export const PickListPage: React.FC = () => {
  const { viewMode } = usePickList();

  return (
    <div className="space-y-3">
      <PickListQuickFilters />

      {viewMode === 'list' && <PickListListView />}
      {viewMode === 'report' && <PickListReportView />}
      {viewMode === 'dashboard' && <PickListDashboardView />}
      {viewMode === 'kanban' && <PickListKanbanView />}
    </div>
  );
};

export default PickListPage;

