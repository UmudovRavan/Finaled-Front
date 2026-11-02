import React from 'react';
import { X } from 'lucide-react';
import { usePurchaseReceipt } from '../../context';
import { NewPurchaseReceiptForm } from './NewPurchaseReceiptForm';

export const AddPurchaseReceiptModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen } = usePurchaseReceipt();

  if (!isAddModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Floating close button */}
        <button
          onClick={() => setIsAddModalOpen(false)}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white bg-white/80 dark:bg-[#1E1E22]/80 backdrop-blur border border-slate-200 dark:border-[#27272A] shadow-sm transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <NewPurchaseReceiptForm
          isModal={true}
          onSuccess={() => setIsAddModalOpen(false)}
        />
      </div>
    </div>
  );
};
