import React from 'react';
import type { StockItemStatus, MovementType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'neon';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantStyles = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
    info: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25',
    neutral: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25',
    neon: 'bg-pink-500/15 text-pink-500 dark:text-pink-400 border-pink-500/30',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

export const StockStatusBadge: React.FC<{ status: StockItemStatus }> = ({ status }) => {
  if (status === 'in_stock') {
    return <Badge variant="success">Kifayət qədər</Badge>;
  }
  if (status === 'low_stock') {
    return <Badge variant="warning">Kritik Qalıq</Badge>;
  }
  return <Badge variant="danger">Bitib</Badge>;
};

export const MovementTypeBadge: React.FC<{ type: MovementType }> = ({ type }) => {
  switch (type) {
    case 'IN':
      return <Badge variant="success">Mədaxil (Giriş)</Badge>;
    case 'OUT':
      return <Badge variant="danger">Məxaric (Çıxış)</Badge>;
    case 'TRANSFER':
      return <Badge variant="info">Transfer</Badge>;
    case 'ADJUSTMENT':
      return <Badge variant="warning">Düzəliş</Badge>;
    default:
      return <Badge variant="neutral">{type}</Badge>;
  }
};

