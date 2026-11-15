import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchaseReceipt } from '../context';
import { stockService } from '../api';
import { PurchaseReceiptDetailContent } from '../components/purchase-receipt/PurchaseReceiptDetailContent';
import { PurchaseReceiptDetailSidebar } from '../components/purchase-receipt/PurchaseReceiptDetailSidebar';

export const PurchaseReceiptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { receipts, isRefreshing, toggleLike, refresh } = usePurchaseReceipt();
  const [isBusy, setIsBusy] = useState(false);

  const decodedId = decodeURIComponent(id || '');
  const currentReceipt = receipts.find(
    (r) => r.id.toLowerCase() === decodedId.toLowerCase()
  );

  if (isRefreshing && !currentReceipt) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Loading Purchase Receipt...
      </div>
    );
  }

  if (!currentReceipt) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Purchase Receipt not found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-5 sm:p-6 transition-colors duration-200 space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {currentReceipt.status === 'Draft' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              if (!window.confirm('Delete this Draft Purchase Receipt?')) return;
              setIsBusy(true);
              try {
                await stockService.deletePurchaseReceipt(currentReceipt.id);
                await refresh();
                navigate('/purchase-receipt');
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium disabled:opacity-50"
          >
            Delete Draft
          </button>
        )}
        {currentReceipt.status === 'Cancelled' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              setIsBusy(true);
              try {
                const amended = await stockService.amendPurchaseReceipt(currentReceipt.id);
                await refresh();
                if (amended?.id) navigate(`/purchase-receipt/${encodeURIComponent(amended.id)}`);
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium disabled:opacity-50"
          >
            Amend
          </button>
        )}
        {currentReceipt.status !== 'Draft' && currentReceipt.status !== 'Cancelled' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              setIsBusy(true);
              try {
                const ret = await stockService.makePurchaseReturn(currentReceipt.id);
                await refresh();
                if (ret?.id) navigate(`/purchase-receipt/${encodeURIComponent(ret.id)}`);
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 text-xs font-medium disabled:opacity-50"
          >
            Make Return
          </button>
        )}
      </div>
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


