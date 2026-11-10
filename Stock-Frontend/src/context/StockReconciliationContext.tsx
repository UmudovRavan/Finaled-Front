import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type {
  StockReconciliationRecord,
  StockReconciliationStatus,
  StockViewMode,
  FilterRule,
} from '../types';
import { stockService, INITIAL_STOCK_RECONCILIATIONS } from '../api';

interface StockReconciliationQuickFiltersState {
  id: string;
  differenceAccount: string;
  costCenter: string;
}

interface StockReconciliationContextType {
  reconciliations: StockReconciliationRecord[];
  filteredReconciliations: StockReconciliationRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  quickFilters: StockReconciliationQuickFiltersState;
  setQuickFilters: React.Dispatch<React.SetStateAction<StockReconciliationQuickFiltersState>>;
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
  createReconciliation: (data: Partial<StockReconciliationRecord>) => Promise<StockReconciliationRecord>;
  updateStatus: (id: string, status: StockReconciliationStatus) => void;
  deleteReconciliations: (ids: string[]) => void;
}

const StockReconciliationContext = createContext<StockReconciliationContextType | undefined>(undefined);

export const StockReconciliationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reconciliations, setReconciliations] = useState<StockReconciliationRecord[]>(() => {
    const saved = localStorage.getItem('altensor_stock_reconciliations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STOCK_RECONCILIATIONS;
      }
    }
    return INITIAL_STOCK_RECONCILIATIONS;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');

  const [quickFilters, setQuickFilters] = useState<StockReconciliationQuickFiltersState>({
    id: '',
    differenceAccount: '',
    costCenter: '',
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [sortField, setSortField] = useState<string>('Created On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem('altensor_stock_reconciliations', JSON.stringify(reconciliations));
  }, [reconciliations]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getStockReconciliations();
      if (data && data.length > 0) {
        setReconciliations(data);
      }
    } catch {
      // Keep local
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const createReconciliation = async (data: Partial<StockReconciliationRecord>): Promise<StockReconciliationRecord> => {
    const created = await stockService.createStockReconciliation(data);
    setReconciliations((prev) => [created, ...prev]);
    return created;
  };

  const updateStatus = (id: string, status: StockReconciliationStatus) => {
    setReconciliations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const deleteReconciliations = (ids: string[]) => {
    setReconciliations((prev) => prev.filter((item) => !ids.includes(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReconciliations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReconciliations.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setReconciliations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isLiked: !item.isLiked } : item
      )
    );
  };

  const filteredReconciliations = useMemo(() => {
    return reconciliations
      .filter((item) => {
        // Saved Filters
        if (savedFilter !== 'All' && item.status !== savedFilter) {
          return false;
        }

        // Quick Filters
        if (
          quickFilters.id &&
          !item.id.toLowerCase().includes(quickFilters.id.toLowerCase())
        ) {
          return false;
        }

        if (
          quickFilters.differenceAccount &&
          !(item.differenceAccount || '')
            .toLowerCase()
            .includes(quickFilters.differenceAccount.toLowerCase())
        ) {
          return false;
        }

        if (
          quickFilters.costCenter &&
          !(item.costCenter || '')
            .toLowerCase()
            .includes(quickFilters.costCenter.toLowerCase())
        ) {
          return false;
        }

        // Advanced filter popover rules
        for (const rule of filterRules) {
          if (!rule.value.trim()) continue;
          const val = rule.value.toLowerCase();
          const target = (
            rule.field === 'ID'
              ? item.id
              : rule.field === 'Difference Account'
              ? item.differenceAccount || ''
              : rule.field === 'Cost Center'
              ? item.costCenter || ''
              : rule.field === 'Status'
              ? item.status
              : rule.field === 'Posting Date'
              ? item.postingDate
              : ''
          ).toLowerCase();

          if (rule.operator === 'Equals' && target !== val) return false;
          if (rule.operator === 'Like' && !target.includes(val)) return false;
          if (rule.operator === '!=' && target === val) return false;
          if (
            rule.operator === 'In' &&
            !val.split(',').map((s) => s.trim()).includes(target)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'Created On') {
          comp = new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime();
        } else if (sortField === 'Posting Date') {
          comp = a.postingDate.localeCompare(b.postingDate);
        } else if (sortField === 'ID') {
          comp = a.id.localeCompare(b.id);
        } else if (sortField === 'Status') {
          comp = a.status.localeCompare(b.status);
        } else {
          comp = a.id.localeCompare(b.id);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [reconciliations, savedFilter, quickFilters, filterRules, sortField, sortOrder]);

  return (
    <StockReconciliationContext.Provider
      value={{
        reconciliations,
        filteredReconciliations,
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
        createReconciliation,
        updateStatus,
        deleteReconciliations,
      }}
    >
      {children}
    </StockReconciliationContext.Provider>
  );
};

export const useStockReconciliation = (): StockReconciliationContextType => {
  const context = useContext(StockReconciliationContext);
  if (!context) {
    throw new Error('useStockReconciliation must be used within a StockReconciliationProvider');
  }
  return context;
};

