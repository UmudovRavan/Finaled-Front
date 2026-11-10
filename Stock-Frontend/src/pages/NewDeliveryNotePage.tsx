import React from 'react';
import { NewDeliveryNoteForm } from '../components/delivery-note/NewDeliveryNoteForm';

export const NewDeliveryNotePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <NewDeliveryNoteForm isModal={false} />
    </div>
  );
};

export default NewDeliveryNotePage;

