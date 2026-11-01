import React from 'react';
import { NewStockEntryForm } from '../components/stock-entry/NewStockEntryForm';

export const NewStockEntryPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-2">
      <NewStockEntryForm />
    </div>
  );
};

export default NewStockEntryPage;
