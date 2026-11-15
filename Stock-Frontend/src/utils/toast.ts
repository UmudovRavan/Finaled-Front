export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;

const listeners = new Set<ToastListener>();

function emit(variant: ToastVariant, title: string, message?: string, duration?: number) {
  const item: ToastItem = {
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    variant,
    title,
    message,
    duration: duration ?? (variant === 'error' ? 5000 : 3500),
  };
  listeners.forEach((listener) => listener(item));
}

export const toast = {
  success(title: string, message?: string, duration?: number) {
    emit('success', title, message, duration);
  },
  error(title: string, message?: string, duration?: number) {
    emit('error', title, message, duration);
  },
  info(title: string, message?: string, duration?: number) {
    emit('info', title, message, duration);
  },
  subscribe(listener: ToastListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

const RESOURCE_LABELS: Array<[string, string]> = [
  ['stock-reconciliations', 'Stock Reconciliation'],
  ['stock-entries', 'Stock Entry'],
  ['purchase-receipts', 'Purchase Receipt'],
  ['delivery-notes', 'Delivery Note'],
  ['material-requests', 'Material Request'],
  ['pick-lists', 'Pick List'],
  ['landed-cost-vouchers', 'Landed Cost Voucher'],
  ['repost-item-valuations', 'Repost Item Valuation'],
  ['packing-slips', 'Packing Slip'],
  ['serial-batch-bundles', 'Serial & Batch Bundle'],
  ['serial-nos', 'Serial No'],
  ['batches', 'Batch'],
  ['uom-conversion-factors', 'UOM Conversion Factor'],
  ['uoms', 'UOM'],
  ['uom', 'UOM'],
  ['item-groups', 'Item Group'],
  ['item-attributes', 'Item Attribute'],
  ['item-alternatives', 'Item Alternative'],
  ['items', 'Item'],
  ['brands', 'Brand'],
  ['warehouses', 'Warehouse'],
  ['inventory-dimensions', 'Inventory Dimension'],
  ['shipping-rules', 'Shipping Rule'],
  ['delivery-trips', 'Delivery Trip'],
  ['quality-inspection-templates', 'Quality Inspection Template'],
  ['stock-settings', 'Stock Settings'],
  ['item-variant-settings', 'Item Variant Settings'],
  ['stock-reposting-settings', 'Stock Reposting Settings'],
  ['delivery-settings', 'Delivery Settings'],
  ['settings', 'Settings'],
];

function resolveResourceLabel(url?: string): string {
  if (!url) return 'Məlumat';
  const clean = url.split('?')[0].toLowerCase();
  for (const [key, label] of RESOURCE_LABELS) {
    if (clean.includes(key)) {
      return label;
    }
  }
  return 'Məlumat';
}

export function notifyApiMutationSuccess(method?: string, url?: string): void {
  const m = (method || '').toLowerCase();
  if (!['post', 'put', 'patch', 'delete'].includes(m)) return;

  const cleanUrl = (url || '').split('?')[0].toLowerCase();
  if (cleanUrl.includes('/auth/')) return;

  const label = resolveResourceLabel(cleanUrl);

  if (cleanUrl.endsWith('/submit')) {
    toast.success(`${label} təsdiqləndi`, 'Əməliyyat uğurla icra olundu.');
    return;
  }
  if (cleanUrl.endsWith('/cancel')) {
    toast.info(`${label} ləğv edildi`, 'Sənəd ləğv statusuna keçirildi.');
    return;
  }

  if (m === 'post') {
    toast.success(`${label} yaradıldı`, 'Yeni qeyd uğurla yadda saxlanıldı.');
  } else if (m === 'put' || m === 'patch') {
    toast.success(`${label} yeniləndi`, 'Dəyişikliklər uğurla yadda saxlanıldı.');
  } else if (m === 'delete') {
    toast.success(`${label} silindi`, 'Qeyd sistemdən silindi.');
  }
}

export function extractApiErrorMessage(error: unknown): string {
  const err = error as {
    response?: {
      status?: number;
      data?: {
        message?: string;
        title?: string;
        detail?: string;
        error?: string;
        errors?: Record<string, string[] | string>;
      };
    };
    message?: string;
  };

  const data = err?.response?.data;
  if (data) {
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (data.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0];
      const val = firstKey ? data.errors[firstKey] : undefined;
      if (Array.isArray(val) && val[0]) return val[0];
      if (typeof val === 'string' && val) return val;
    }
    if (typeof data.title === 'string' && data.title.trim()) return data.title;
  }

  if (err?.response?.status === 403) {
    return 'Bu əməliyyatı icra etmək üçün icazəniz yoxdur.';
  }
  if (err?.response?.status === 404) {
    return 'Tələb olunan məlumat və ya ünvan tapılmadı.';
  }
  if (err?.response?.status && err.response.status >= 500) {
    return 'Server xətası baş verdi. Zəhmət olmasa bir az sonra yenidən yoxlayın.';
  }

  return err?.message || 'Naməlum xəta baş verdi.';
}

export function notifyApiError(error: unknown, method?: string, url?: string): void {
  const cleanUrl = (url || '').split('?')[0].toLowerCase();
  if (cleanUrl.includes('/auth/refresh')) return;

  const m = (method || '').toLowerCase();
  const isMutation = ['post', 'put', 'patch', 'delete'].includes(m);
  const status = (error as { response?: { status?: number } })?.response?.status;

  // Show error toast on all mutations or non-401 failures
  if (!isMutation && status === 401) return;

  const label = resolveResourceLabel(cleanUrl);
  const message = extractApiErrorMessage(error);
  toast.error(isMutation ? `${label} — Xəta` : 'Xəta baş verdi', message);
}
