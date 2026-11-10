import React from 'react';
import DeliveryNoteQuickFilters from '../components/delivery-note/DeliveryNoteQuickFilters';
import DeliveryNoteListView from '../components/delivery-note/DeliveryNoteListView';
import DeliveryNoteReportView from '../components/delivery-note/DeliveryNoteReportView';
import DeliveryNoteDashboardView from '../components/delivery-note/DeliveryNoteDashboardView';
import DeliveryNoteKanbanView from '../components/delivery-note/DeliveryNoteKanbanView';
import AddDeliveryNoteModal from '../components/delivery-note/AddDeliveryNoteModal';
import DeliveryNoteDetailModal from '../components/delivery-note/DeliveryNoteDetailModal';
import { useDeliveryNote } from '../context';

export const DeliveryNotePage: React.FC = () => {
  const { viewMode } = useDeliveryNote();

  return (
    <div className="space-y-3">
      {/* 1. Quick Filters Row (Image 1 & Image 2) */}
      <DeliveryNoteQuickFilters />

      {/* 2. Main Selected View */}
      {viewMode === 'list' && <DeliveryNoteListView />}
      {viewMode === 'report' && <DeliveryNoteReportView />}
      {viewMode === 'dashboard' && <DeliveryNoteDashboardView />}
      {viewMode === 'kanban' && <DeliveryNoteKanbanView />}

      {/* 3. Interactive Modals */}
      <AddDeliveryNoteModal />
      <DeliveryNoteDetailModal />
    </div>
  );
};

export default DeliveryNotePage;

