import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Warehouse } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
        <Warehouse className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">404 - Səhifə Tapılmadı</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        Axtardığınız səhifə mövcud deyil və ya ünvanı dəyişdirilib.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ana səhifəyə qayıt</span>
      </Link>
    </div>
  );
};

