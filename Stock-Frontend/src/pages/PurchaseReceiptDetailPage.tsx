import React from 'react';
import { useParams } from 'react-router-dom';
import { usePurchaseReceipt } from '../context';
import { PurchaseReceiptDetailContent } from '../components/purchase-receipt/PurchaseReceiptDetailContent';
import { PurchaseReceiptDetailSidebar } from '../components/purchase-receipt/PurchaseReceiptDetailSidebar';

export const PurchaseReceiptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { receipts, toggleLike, updateStatus } = usePurchaseReceipt();

  const currentReceipt =
    receipts.find((r) => r.id === id) ||
    receipts[0] || {
      id: 'MAT-PR-RE-2026-00001',
      supplierName: 'Summit Traders Ltd.',
      postingDate: '03-11-2026',
      postingTime: '12:17:00',
      grandTotal: 396.0,
      netTotal: 396.0,
      status: 'Draft',
      perAmountBilled: 0,
      perReturned: 0,
      company: 'Avalon (Demo)',
      currency: 'USD',
      createdOn: new Date().toISOString(),
      lastUpdatedOn: new Date().toISOString(),
      timeAgoText: '3 m',
      commentsCount: 0,
      isLiked: false,
      items: [
        {
          id: 'it-1',
          itemCode: 'SKU001',
          itemName: 'Dell XPS 15 Laptop',
          receivedQty: 2,
          acceptedQty: 2,
          rejectedQty: 0,
          uom: 'Nos',
          rate: 198.0,
          amount: 396.0,
          warehouse: 'Stores - AD',
        },
      ],
    };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-5 sm:p-6 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Document Content (Left 75%) */}
        <PurchaseReceiptDetailContent receipt={currentReceipt} />

        {/* Sidebar Panel (Right 25%) */}
        <PurchaseReceiptDetailSidebar
          title={currentReceipt.supplierName}
          documentId={currentReceipt.id}
          isLiked={currentReceipt.isLiked}
          onToggleLike={() => toggleLike(currentReceipt.id)}
        />
      </div>
    </div>
  );
};

export default PurchaseReceiptDetailPage;


