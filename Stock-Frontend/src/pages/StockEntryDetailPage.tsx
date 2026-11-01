import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStockEntry } from '../context';
import { StockEntryDetailContent } from '../components/stock-entry/StockEntryDetailContent';
import { StockEntryDetailSidebar } from '../components/stock-entry/StockEntryDetailSidebar';

export const StockEntryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, toggleLike, updateStatus } = useStockEntry();

  const currentEntry =
    entries.find((e) => e.id === id) ||
    entries[0] || {
      id: 'MAT-STE-2026-00001',
      title: 'Material Receipt',
      stockEntryType: 'Material Receipt',
      status: 'Draft',
      purpose: 'Material Receipt',
      defaultSourceWarehouse: '',
      defaultTargetWarehouse: 'Devam Eden İşler - AD',
      perTransferred: 0,
      isReturn: false,
      company: 'Avalon (Demo)',
      createdOn: new Date().toISOString(),
      lastUpdatedOn: new Date().toISOString(),
      timeAgoText: 'now',
      commentsCount: 0,
      isLiked: false,
      items: [
        {
          id: 'it-1',
          itemCode: 'SKU002',
          itemName: 'Laptop',
          qty: 10,
          uom: 'Nos',
          basicRate: 50.0,
          amount: 500.0,
        },
      ],
    };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-5 sm:p-6 transition-colors duration-200">
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


