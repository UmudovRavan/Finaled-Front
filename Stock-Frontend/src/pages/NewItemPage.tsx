import React from 'react';
import { NewItemForm } from '../components/item';

export const NewItemPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-1">
      <NewItemForm />
    </div>
  );
};

export default NewItemPage;

