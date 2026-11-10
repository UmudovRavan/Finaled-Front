import React from 'react';
import MaterialRequestQuickFilters from '../components/material-request/MaterialRequestQuickFilters';
import MaterialRequestListView from '../components/material-request/MaterialRequestListView';
import MaterialRequestReportView from '../components/material-request/MaterialRequestReportView';
import MaterialRequestDashboardView from '../components/material-request/MaterialRequestDashboardView';
import MaterialRequestKanbanView from '../components/material-request/MaterialRequestKanbanView';
import { useMaterialRequest } from '../context';

export const MaterialRequestPage: React.FC = () => {
  const { viewMode } = useMaterialRequest();

  return (
    <div className="space-y-3">
      <MaterialRequestQuickFilters />

      {viewMode === 'list' && <MaterialRequestListView />}
      {viewMode === 'report' && <MaterialRequestReportView />}
      {viewMode === 'dashboard' && <MaterialRequestDashboardView />}
      {viewMode === 'kanban' && <MaterialRequestKanbanView />}
    </div>
  );
};

export default MaterialRequestPage;

