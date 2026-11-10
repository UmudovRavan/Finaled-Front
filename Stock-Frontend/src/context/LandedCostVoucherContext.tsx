import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type {
  LandedCostVoucherRecord,
  LandedCostVoucherStatus,
  StockViewMode,
  FilterRule,
} from '../types';
import { stockService, INITIAL_LANDED_COST_VOUCHERS } from '../api';

interface LandedCostVoucherQuickFiltersState {
  id: string;
  company: string;
}

interface LandedCostVoucherContextType {
  vouchers: LandedCostVoucherRecord[];
  filteredVouchers: LandedCostVoucherRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  quickFilters: LandedCostVoucherQuickFiltersState;
  setQuickFilters: React.Dispatch<React.SetStateAction<LandedCostVoucherQuickFiltersState>>;
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
  createVoucher: (data: Partial<LandedCostVoucherRecord>) => Promise<LandedCostVoucherRecord>;
  updateStatus: (id: string, status: LandedCostVoucherStatus) => void;
  deleteVouchers: (ids: string[]) => void;
}

const LandedCostVoucherContext = createContext<LandedCostVoucherContextType | undefined>(undefined);

export const LandedCostVoucherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vouchers, setVouchers] = useState<LandedCostVoucherRecord[]>(() => {
    const saved = localStorage.getItem('altensor_landed_cost_vouchers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].items?.[0]?.itemCode === 'SKU010') {
          return parsed;
        }
        return INITIAL_LANDED_COST_VOUCHERS;
      } catch {
        return INITIAL_LANDED_COST_VOUCHERS;
      }
    }
    return INITIAL_LANDED_COST_VOUCHERS;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');

  const [quickFilters, setQuickFilters] = useState<LandedCostVoucherQuickFiltersState>({
    id: '',
    company: '',
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [sortField, setSortField] = useState<string>('createdOn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('altensor_landed_cost_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  // Load from API on mount
  useEffect(() => {
    let isMounted = true;
    stockService.getLandedCostVouchers().then((data) => {
      if (isMounted && data && data.length > 0) {
        setVouchers((prev) => (prev.length > 0 ? prev : data));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getLandedCostVouchers();
      if (data && data.length > 0) {
        setVouchers(data);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const createVoucher = async (data: Partial<LandedCostVoucherRecord>) => {
    const created = await stockService.createLandedCostVoucher(data);
    setVouchers((prev) => [created, ...prev]);
    return created;
  };

  const updateStatus = (id: string, status: LandedCostVoucherStatus) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status, lastUpdatedOn: new Date().toISOString() } : v))
    );
  };

  const deleteVouchers = (ids: string[]) => {
    setVouchers((prev) => prev.filter((v) => !ids.includes(v.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVouchers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVouchers.map((v) => v.id));
    }
  };

  const toggleLike = (id: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isLiked: !v.isLiked } : v))
    );
  };

  // Filtered & Sorted vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers
      .filter((v) => {
        // Quick Filters
        if (quickFilters.id && !v.id.toLowerCase().includes(quickFilters.id.toLowerCase())) {
          return false;
        }
        if (
          quickFilters.company &&
          !v.company.toLowerCase().includes(quickFilters.company.toLowerCase())
        ) {
          return false;
        }

        // Saved Filters
        if (savedFilter === 'Draft' && v.status !== 'Draft') return false;
        if (savedFilter === 'Submitted' && v.status !== 'Submitted') return false;
        if (savedFilter === 'Cancelled' && v.status !== 'Cancelled') return false;

        // Custom Filter Rules
        for (const rule of filterRules) {
          if (!rule.value) continue;
          const val = String((v as any)[rule.field] || '').toLowerCase();
          const target = rule.value.toLowerCase();
          if (rule.operator === 'Equals' && val !== target) return false;
          if (rule.operator === 'Like' && !val.includes(target)) return false;
          if (rule.operator === '!=' && val === target) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? '';
        const valB = (b as any)[sortField] ?? '';
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [vouchers, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <LandedCostVoucherContext.Provider
      value={{
        vouchers,
        filteredVouchers,
        viewMode,
        setViewMode,
        savedFilter,
        setSavedFilter,
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
        createVoucher,
        updateStatus,
        deleteVouchers,
      }}
    >
      {children}
    </LandedCostVoucherContext.Provider>
  );
};

export const useLandedCostVoucher = () => {
  const context = useContext(LandedCostVoucherContext);
  if (!context) {
    throw new Error('useLandedCostVoucher must be used within a LandedCostVoucherProvider');
  }
  return context;
};
