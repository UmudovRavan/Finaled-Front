import React from 'react';
import { NewPurchaseReceiptForm } from '../components/purchase-receipt/NewPurchaseReceiptForm';

export const NewPurchaseReceiptPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <NewPurchaseReceiptForm isModal={false} />
    </div>
  );
};
