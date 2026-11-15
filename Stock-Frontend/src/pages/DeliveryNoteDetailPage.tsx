import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeliveryNote } from '../context';
import { stockService } from '../api';
import { DeliveryNoteDetailContent } from '../components/delivery-note/DeliveryNoteDetailContent';
import { DeliveryNoteDetailSidebar } from '../components/delivery-note/DeliveryNoteDetailSidebar';

export const DeliveryNoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, isRefreshing, toggleLike, refresh } = useDeliveryNote();
  const [isBusy, setIsBusy] = useState(false);

  const decodedId = decodeURIComponent(id || '');
  const currentNote = notes.find(
    (n) => n.id.toLowerCase() === decodedId.toLowerCase()
  );

  if (isRefreshing && !currentNote) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Loading Delivery Note...
      </div>
    );
  }

  if (!currentNote) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Delivery Note not found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-5 sm:p-6 transition-colors duration-200 space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {currentNote.status === 'Draft' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              if (!window.confirm('Delete this Draft Delivery Note?')) return;
              setIsBusy(true);
              try {
                await stockService.deleteDeliveryNote(currentNote.id);
                await refresh();
                navigate('/delivery-note');
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium disabled:opacity-50"
          >
            Delete Draft
          </button>
        )}
        {currentNote.status === 'Cancelled' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              setIsBusy(true);
              try {
                const amended = await stockService.amendDeliveryNote(currentNote.id);
                await refresh();
                if (amended?.id) navigate(`/delivery-note/${encodeURIComponent(amended.id)}`);
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium disabled:opacity-50"
          >
            Amend
          </button>
        )}
        {currentNote.status !== 'Draft' && currentNote.status !== 'Cancelled' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              setIsBusy(true);
              try {
                const ret = await stockService.makeSalesReturn(currentNote.id);
                await refresh();
                if (ret?.id) navigate(`/delivery-note/${encodeURIComponent(ret.id)}`);
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

