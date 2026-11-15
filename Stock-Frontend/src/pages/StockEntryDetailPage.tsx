import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStockEntry } from '../context';
import { stockService } from '../api';
import { StockEntryDetailContent } from '../components/stock-entry/StockEntryDetailContent';
import { StockEntryDetailSidebar } from '../components/stock-entry/StockEntryDetailSidebar';

export const StockEntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, isRefreshing, toggleLike, refresh } = useStockEntry();
  const [isBusy, setIsBusy] = useState(false);

  const decodedId = decodeURIComponent(id || '');
  const currentEntry = entries.find(
    (e) => e.id.toLowerCase() === decodedId.toLowerCase()
  );

  if (isRefreshing && !currentEntry) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Loading Stock Entry...
      </div>
    );
  }

  if (!currentEntry) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Stock Entry not found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-5 sm:p-6 transition-colors duration-200 space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {currentEntry.status === 'Draft' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              if (!window.confirm('Delete this Draft Stock Entry?')) return;
              setIsBusy(true);
              try {
                await stockService.deleteStockEntry(currentEntry.id);
                await refresh();
                navigate('/stock-entry');
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium disabled:opacity-50"
          >
            Delete Draft
          </button>
        )}
        {currentEntry.status === 'Submitted' && currentEntry.purpose === 'Material Transfer' && (
          <button
            type="button"
            disabled={isBusy}
            onClick={async () => {
              setIsBusy(true);
              try {
                const ended = await stockService.endTransitStockEntry(
                  currentEntry.id,
                  currentEntry.defaultTargetWarehouse || ''
                );
                await refresh();
                if (ended?.id) navigate(`/stock-entry/${encodeURIComponent(ended.id)}`);
              } finally {
                setIsBusy(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium disabled:opacity-50"
          >
            End Transit
          </button>
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Document Content (Left 75%) */}
        <StockEntryDetailContent entry={currentEntry} />

        {/* Sidebar Panel (Right 25%) */}
        <StockEntryDetailSidebar
          title={currentEntry.title || currentEntry.stockEntryType}
          documentId={currentEntry.id}
          isLiked={currentEntry.isLiked}
          onToggleLike={() => toggleLike(currentEntry.id)}
        />
      </div>
    </div>
  );
};

export default StockEntryDetailPage;


