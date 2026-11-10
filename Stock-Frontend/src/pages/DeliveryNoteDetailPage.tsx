import React from 'react';
import { useParams } from 'react-router-dom';
import { useDeliveryNote } from '../context';
import { DeliveryNoteDetailContent } from '../components/delivery-note/DeliveryNoteDetailContent';
import { DeliveryNoteDetailSidebar } from '../components/delivery-note/DeliveryNoteDetailSidebar';

export const DeliveryNoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { notes, toggleLike } = useDeliveryNote();

  const currentNote =
    notes.find((n) => n.id === id) ||
    notes[0] || {
      id: 'MAT-DN-2026-00001',
      customer: 'Grant Plastics Ltd.',
      customerName: 'Grant Plastics Ltd.',
      date: '09-11-2026',
      postingDate: '09-11-2026',
      postingTime: '14:53:21',
      grandTotal: 0.0,
      netTotal: 0.0,
      status: 'Draft',
      perAmountBilled: 0,
      perReturned: 0,
      company: 'Avalon (Demo)',
      currency: 'USD',
      setTargetWarehouse: '',
      setSourceWarehouse: 'Bitmiş Ürünler - AD',
      isReturn: false,
      createdOn: new Date().toISOString(),
      lastUpdatedOn: new Date().toISOString(),
      timeAgoText: '35 minutes ago',
      commentsCount: 0,
      isLiked: false,
      items: [
        {
          id: 'it-dn-1',
          itemCode: 'SKU002: Laptop',
          itemName: 'SKU002: Laptop',
          qty: 1,
          uom: 'Nos',
          rate: 0.0,
          amount: 0.0,
          warehouse: 'Bitmiş Ürünler - AD',
        },
      ],
    };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-5 sm:p-6 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Document Content (Left 75%) */}
        <DeliveryNoteDetailContent note={currentNote} />

        {/* Sidebar Panel (Right 25%) */}
        <DeliveryNoteDetailSidebar
          title={currentNote.customerName}
          documentId={currentNote.id}
          isLiked={currentNote.isLiked}
          onToggleLike={() => toggleLike(currentNote.id)}
        />
      </div>
    </div>
  );
};

export default DeliveryNoteDetailPage;

