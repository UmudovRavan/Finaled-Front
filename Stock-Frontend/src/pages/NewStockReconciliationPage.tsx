import React from 'react';
import { NewStockReconciliationForm } from '../components/stock-reconciliation/NewStockReconciliationForm';

export const NewStockReconciliationPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <NewStockReconciliationForm />
    </div>
  );
};

export default NewStockReconciliationPage;

