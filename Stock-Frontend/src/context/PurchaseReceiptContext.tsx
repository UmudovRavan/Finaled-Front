import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { PurchaseReceiptRecord, PurchaseReceiptStatus, StockViewMode, FilterRule } from '../types';
import { stockService, INITIAL_PURCHASE_RECEIPTS } from '../api';

interface QuickFilters {
  id: string;
  supplierName: string;
  company: string;
  status: string;
}

interface PurchaseReceiptContextType {
  receipts: PurchaseReceiptRecord[];
  filteredReceipts: PurchaseReceiptRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectedReceipt: PurchaseReceiptRecord | null;
  setSelectedReceipt: (receipt: PurchaseReceiptRecord | null) => void;
  quickFilters: QuickFilters;
  setQuickFilters: React.Dispatch<React.SetStateAction<QuickFilters>>;
  filterRules: FilterRule[];
  setFilterRules: React.Dispatch<React.SetStateAction<FilterRule[]>>;
  isFilterPopoverOpen: boolean;
  setIsFilterPopoverOpen: (open: boolean) => void;
  sortField: string;
  setSortField: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  refresh: () => void;
  isRefreshing: boolean;
  createReceipt: (data: Partial<PurchaseReceiptRecord>) => Promise<PurchaseReceiptRecord>;
  updateStatus: (id: string, status: PurchaseReceiptStatus) => void;
  deleteReceipts: (ids: string[]) => void;
}

const PurchaseReceiptContext = createContext<PurchaseReceiptContextType | undefined>(undefined);

export const PurchaseReceiptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [receipts, setReceipts] = useState<PurchaseReceiptRecord[]>(() => {
    const saved = localStorage.getItem('altensor_purchase_receipts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PURCHASE_RECEIPTS;
      }
    }
    return INITIAL_PURCHASE_RECEIPTS;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceiptRecord | null>(null);

  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    id: '',
    supplierName: '',
    company: '',
    status: '',
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [sortField, setSortField] = useState<string>('Created On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem('altensor_purchase_receipts', JSON.stringify(receipts));
  }, [receipts]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getPurchaseReceipts();
      if (data && data.length > 0) {
        setReceipts(data);
      }
    } catch {
      // Keep existing data
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReceipts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReceipts.map((e) => e.id));
    }
  };

  const toggleLike = (id: string) => {
    setReceipts((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isLiked: !e.isLiked } : e))
    );
  };

  const createReceipt = async (data: Partial<PurchaseReceiptRecord>) => {
    const created = await stockService.createPurchaseReceipt(data);
    setReceipts((prev) => [created, ...prev]);
    return created;
  };

  const updateStatus = (id: string, status: PurchaseReceiptStatus) => {
    setReceipts((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              perAmountBilled: status === 'Completed' ? 100 : e.perAmountBilled,
              lastUpdatedOn: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const deleteReceipts = (ids: string[]) => {
    setReceipts((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  // Filter & sort logic
  const filteredReceipts = useMemo(() => {
    let result = [...receipts];

    // Quick filters from Image 1: ID ≈, Supplier Name ≈, Company, Status
    if (quickFilters.id.trim()) {
      const q = quickFilters.id.toLowerCase().trim();
      result = result.filter((e) => e.id.toLowerCase().includes(q));
    }
    if (quickFilters.supplierName.trim()) {
      const q = quickFilters.supplierName.toLowerCase().trim();
      result = result.filter((e) => e.supplierName.toLowerCase().includes(q));
    }
    if (quickFilters.company.trim()) {
      const q = quickFilters.company.toLowerCase().trim();
      result = result.filter((e) => e.company.toLowerCase().includes(q));
    }
    if (quickFilters.status.trim()) {
      const q = quickFilters.status.toLowerCase().trim();
      result = result.filter((e) => e.status.toLowerCase() === q);
    }

    // Saved Filter
    if (savedFilter !== 'All') {
      result = result.filter((e) => e.status === savedFilter);
    }

    // Advanced Filter Rules
    for (const rule of filterRules) {
      if (!rule.value.trim()) continue;
      const val = rule.value.toLowerCase().trim();

      result = result.filter((e) => {
        let fieldVal = '';
        if (rule.field === 'ID') fieldVal = e.id;
        else if (rule.field === 'Supplier Name') fieldVal = e.supplierName;
        else if (rule.field === 'Status') fieldVal = e.status;
        else if (rule.field === 'Company') fieldVal = e.company;
        else if (rule.field === 'Date') fieldVal = e.date;
        else if (rule.field === 'Grand Total') fieldVal = String(e.grandTotal);

        fieldVal = fieldVal.toLowerCase();

        if (rule.operator === 'Equals') return fieldVal === val;
        if (rule.operator === 'Like') return fieldVal.includes(val);
        if (rule.operator === '!=') return fieldVal !== val;
        if (rule.operator === 'In') return val.split(',').map((s) => s.trim()).includes(fieldVal);
        return true;
      });
    }

    // Sorting from Image 2
    result.sort((a, b) => {
      let valA: any = a.createdOn;
      let valB: any = b.createdOn;

      if (sortField === 'Created On') {
        valA = new Date(a.createdOn).getTime();
        valB = new Date(b.createdOn).getTime();
      } else if (sortField === 'Last Updated On') {
        valA = new Date(a.lastUpdatedOn).getTime();
        valB = new Date(b.lastUpdatedOn).getTime();
      } else if (sortField === 'Supplier Name') {
        valA = a.supplierName;
        valB = b.supplierName;
      } else if (sortField === 'ID') {
        valA = a.id;
        valB = b.id;
      } else if (sortField === 'Date') {
        valA = a.date;
        valB = b.date;
      } else if (sortField === 'Company') {
        valA = a.company;
        valB = b.company;
      } else if (sortField === 'Grand Total') {
        valA = a.grandTotal;
        valB = b.grandTotal;
      } else if (sortField === 'Status') {
        valA = a.status;
        valB = b.status;
      } else if (sortField === '% Amount Billed') {
        valA = a.perAmountBilled;
        valB = b.perAmountBilled;
      } else if (sortField === '% Returned') {
        valA = a.perReturned;
        valB = b.perReturned;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [receipts, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <PurchaseReceiptContext.Provider
      value={{
        receipts,
        filteredReceipts,
        viewMode,
        setViewMode,
        savedFilter,
        setSavedFilter,
        isAddModalOpen,
        setIsAddModalOpen,
        selectedReceipt,
        setSelectedReceipt,
        quickFilters,
        setQuickFilters,
        filterRules,
        setFilterRules,
        isFilterPopoverOpen,
        setIsFilterPopoverOpen,
        sortField,
        setSortField,
        sortOrder,
        setSortOrder,
        pageSize,
        setPageSize,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        refresh,
        isRefreshing,
        createReceipt,
        updateStatus,
        deleteReceipts,
      }}
    >
      {children}
    </PurchaseReceiptContext.Provider>
  );
};

export const usePurchaseReceipt = () => {
  const context = useContext(PurchaseReceiptContext);
  if (!context) {
    throw new Error('usePurchaseReceipt must be used within a PurchaseReceiptProvider');
  }
  return context;
};

