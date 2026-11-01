import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { StockEntryRecord, StockViewMode, FilterRule } from '../types';
import { stockService, INITIAL_STOCK_ENTRIES } from '../api';

interface QuickFilters {
  id: string;
  stockEntryType: string;
  defaultSourceWarehouse: string;
  defaultTargetWarehouse: string;
}

interface StockEntryContextType {
  entries: StockEntryRecord[];
  filteredEntries: StockEntryRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectedEntry: StockEntryRecord | null;
  setSelectedEntry: (entry: StockEntryRecord | null) => void;
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
  createEntry: (data: Partial<StockEntryRecord>) => Promise<void>;
  updateStatus: (id: string, status: 'Draft' | 'Submitted' | 'Cancelled') => void;
  deleteEntries: (ids: string[]) => void;
}

const StockEntryContext = createContext<StockEntryContextType | undefined>(undefined);

export const StockEntryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<StockEntryRecord[]>(() => {
    const saved = localStorage.getItem('altensor_stock_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STOCK_ENTRIES;
      }
    }
    return INITIAL_STOCK_ENTRIES;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StockEntryRecord | null>(null);

  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    id: '',
    stockEntryType: '',
    defaultSourceWarehouse: '',
    defaultTargetWarehouse: '',
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [sortField, setSortField] = useState<string>('Created On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem('altensor_stock_entries', JSON.stringify(entries));
  }, [entries]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getStockEntries();
      if (data && data.length > 0) {
        setEntries(data);
      }
    } catch {
      // Keep current data
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
    if (selectedIds.length === filteredEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map((e) => e.id));
    }
  };

  const toggleLike = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isLiked: !e.isLiked } : e))
    );
    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry((prev) => (prev ? { ...prev, isLiked: !prev.isLiked } : null));
    }
  };

  const createEntry = async (data: Partial<StockEntryRecord>) => {
    const created = await stockService.createStockEntry(data);
    setEntries((prev) => [created, ...prev]);
  };

  const updateStatus = (id: string, status: 'Draft' | 'Submitted' | 'Cancelled') => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              perTransferred: status === 'Submitted' ? 100 : e.perTransferred,
              lastUpdatedOn: new Date().toISOString(),
            }
          : e
      )
    );
    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry((prev) =>
        prev
          ? {
              ...prev,
              status,
              perTransferred: status === 'Submitted' ? 100 : prev.perTransferred,
              lastUpdatedOn: new Date().toISOString(),
            }
          : null
      );
    }
  };

  const deleteEntries = (ids: string[]) => {
    setEntries((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    if (selectedEntry && ids.includes(selectedEntry.id)) {
      setSelectedEntry(null);
    }
  };

  // Filter & sort logic
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Quick filters
    if (quickFilters.id.trim()) {
      const q = quickFilters.id.toLowerCase().trim();
      result = result.filter((e) => e.id.toLowerCase().includes(q));
    }
    if (quickFilters.stockEntryType.trim()) {
      const q = quickFilters.stockEntryType.toLowerCase().trim();
      result = result.filter((e) =>
        e.stockEntryType.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
      );
    }
    if (quickFilters.defaultSourceWarehouse.trim()) {
      const q = quickFilters.defaultSourceWarehouse.toLowerCase().trim();
      result = result.filter((e) =>
        (e.defaultSourceWarehouse || '').toLowerCase().includes(q)
      );
    }
    if (quickFilters.defaultTargetWarehouse.trim()) {
      const q = quickFilters.defaultTargetWarehouse.toLowerCase().trim();
      result = result.filter((e) =>
        (e.defaultTargetWarehouse || '').toLowerCase().includes(q)
      );
    }

    // Saved Filter
    if (savedFilter !== 'All') {
      if (['Draft', 'Submitted', 'Cancelled'].includes(savedFilter)) {
        result = result.filter((e) => e.status === savedFilter);
      } else if (
        ['Material Receipt', 'Material Issue', 'Material Transfer', 'Manufacture', 'Repack'].includes(
          savedFilter
        )
      ) {
        result = result.filter((e) => e.stockEntryType === savedFilter);
      }
    }

    // Advanced Filter Rules (Image 5)
    for (const rule of filterRules) {
      if (!rule.value.trim()) continue;
      const val = rule.value.toLowerCase().trim();

      result = result.filter((e) => {
        let fieldVal = '';
        if (rule.field === 'ID') fieldVal = e.id;
        else if (rule.field === 'Stock Entry Type') fieldVal = e.stockEntryType;
        else if (rule.field === 'Purpose') fieldVal = e.purpose;
        else if (rule.field === 'Status') fieldVal = e.status;
        else if (rule.field === 'Default Target Warehouse') fieldVal = e.defaultTargetWarehouse || '';
        else if (rule.field === 'Default Source Warehouse') fieldVal = e.defaultSourceWarehouse || '';
        else if (rule.field === 'Supplier Name') fieldVal = e.supplierName || '';

        fieldVal = fieldVal.toLowerCase();

        if (rule.operator === 'Equals') return fieldVal === val;
        if (rule.operator === 'Like') return fieldVal.includes(val);
        if (rule.operator === '!=') return fieldVal !== val;
        if (rule.operator === 'In') return val.split(',').map((s) => s.trim()).includes(fieldVal);
        return true;
      });
    }

    // Sorting (Image 4)
    result.sort((a, b) => {
      let valA: any = a.createdOn;
      let valB: any = b.createdOn;

      if (sortField === 'Created On') {
        valA = new Date(a.createdOn).getTime();
        valB = new Date(b.createdOn).getTime();
      } else if (sortField === 'Last Updated On') {
        valA = new Date(a.lastUpdatedOn).getTime();
        valB = new Date(b.lastUpdatedOn).getTime();
      } else if (sortField === 'ID') {
        valA = a.id;
        valB = b.id;
      } else if (sortField === 'Stock Entry Type') {
        valA = a.stockEntryType;
        valB = b.stockEntryType;
      } else if (sortField === 'Purpose') {
        valA = a.purpose;
        valB = b.purpose;
      } else if (sortField === 'Default Source Warehouse') {
        valA = a.defaultSourceWarehouse || '';
        valB = b.defaultSourceWarehouse || '';
      } else if (sortField === 'Default Target Warehouse') {
        valA = a.defaultTargetWarehouse || '';
        valB = b.defaultTargetWarehouse || '';
      } else if (sortField === 'Supplier Name') {
        valA = a.supplierName || '';
        valB = b.supplierName || '';
      } else if (sortField === 'Per Transferred') {
        valA = a.perTransferred;
        valB = b.perTransferred;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [entries, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <StockEntryContext.Provider
      value={{
        entries,
        filteredEntries,
        viewMode,
        setViewMode,
        savedFilter,
        setSavedFilter,
        isAddModalOpen,
        setIsAddModalOpen,
        selectedEntry,
        setSelectedEntry,
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
        createEntry,
        updateStatus,
        deleteEntries,
      }}
    >
      {children}
    </StockEntryContext.Provider>
  );
};

export const useStockEntry = () => {
  const context = useContext(StockEntryContext);
  if (!context) {
    throw new Error('useStockEntry must be used within a StockEntryProvider');
  }
  return context;
};

