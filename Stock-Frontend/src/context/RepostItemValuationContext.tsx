import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import type {
  RepostItemValuationRecord,
  RepostItemValuationStatus,
  StockViewMode,
  FilterRule,
} from '../types';
import { stockService, INITIAL_REPOST_ITEM_VALUATIONS } from '../api';

interface RepostItemValuationQuickFiltersState {
  id: string;
  voucherType: string;
  voucherNo: string;
  status: string;
}

interface RepostItemValuationContextType {
  valuations: RepostItemValuationRecord[];
  filteredValuations: RepostItemValuationRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  quickFilters: RepostItemValuationQuickFiltersState;
  setQuickFilters: React.Dispatch<
    React.SetStateAction<RepostItemValuationQuickFiltersState>
  >;
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
  createValuation: (
    data: Partial<RepostItemValuationRecord>
  ) => Promise<RepostItemValuationRecord>;
  updateStatus: (id: string, status: RepostItemValuationStatus) => void;
  deleteValuations: (ids: string[]) => void;
}

const RepostItemValuationContext = createContext<
  RepostItemValuationContextType | undefined
>(undefined);

export const RepostItemValuationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [valuations, setValuations] = useState<RepostItemValuationRecord[]>(() => {
    const saved = localStorage.getItem('altensor_repost_item_valuations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_REPOST_ITEM_VALUATIONS;
      }
    }
    return INITIAL_REPOST_ITEM_VALUATIONS;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [sortField, setSortField] = useState('Created On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [quickFilters, setQuickFilters] =
    useState<RepostItemValuationQuickFiltersState>({
      id: '',
      voucherType: '',
      voucherNo: '',
      status: '',
    });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

  useEffect(() => {
    localStorage.setItem(
      'altensor_repost_item_valuations',
      JSON.stringify(valuations)
    );
  }, [valuations]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getRepostItemValuations();
      if (data && data.length > 0) {
        setValuations(data);
      }
    } catch (err) {
      console.error('Failed to refresh repost item valuations:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const createValuation = async (
    data: Partial<RepostItemValuationRecord>
  ): Promise<RepostItemValuationRecord> => {
    const res = await stockService.createRepostItemValuation(data);
    setValuations((prev) => [res, ...prev]);
    return res;
  };

  const updateStatus = (id: string, status: RepostItemValuationStatus) => {
    setValuations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
  };

  const deleteValuations = (ids: string[]) => {
    setValuations((prev) => prev.filter((v) => !ids.includes(v.id)));
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredValuations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredValuations.map((v) => v.id));
    }
  };

  const toggleLike = (id: string) => {
    setValuations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isLiked: !v.isLiked } : v))
    );
  };

  const filteredValuations = useMemo(() => {
    let result = [...valuations];

    // Quick filters
    if (quickFilters.id.trim()) {
      const q = quickFilters.id.toLowerCase().trim();
      result = result.filter((v) => v.id.toLowerCase().includes(q));
    }
    if (quickFilters.voucherType.trim()) {
      const q = quickFilters.voucherType.toLowerCase().trim();
      result = result.filter((v) =>
        (v.voucherType || '').toLowerCase().includes(q)
      );
    }
    if (quickFilters.voucherNo.trim()) {
      const q = quickFilters.voucherNo.toLowerCase().trim();
      result = result.filter((v) =>
        (v.voucherNo || '').toLowerCase().includes(q)
      );
    }
    if (quickFilters.status.trim()) {
      const q = quickFilters.status.toLowerCase().trim();
      result = result.filter((v) => v.status.toLowerCase() === q);
    }

    // Saved filter
    if (savedFilter !== 'All') {
      result = result.filter((v) => v.status === savedFilter);
    }

    // Advanced rules
    for (const rule of filterRules) {
      if (!rule.value.trim()) continue;
      const val = rule.value.toLowerCase().trim();

      result = result.filter((v) => {
        let fieldVal = '';
        if (rule.field === 'ID') fieldVal = v.id;
        else if (rule.field === 'Status') fieldVal = v.status;
        else if (rule.field === 'Voucher Type') fieldVal = v.voucherType || '';
        else if (rule.field === 'Voucher No') fieldVal = v.voucherNo || '';
        else if (rule.field === 'Company') fieldVal = v.company;
        else if (rule.field === 'Item Code') fieldVal = v.itemCode || '';
        else if (rule.field === 'Warehouse') fieldVal = v.warehouse || '';

        fieldVal = fieldVal.toLowerCase();

        if (rule.operator === 'Equals') return fieldVal === val;
        if (rule.operator === 'Like') return fieldVal.includes(val);
        if (rule.operator === '!=') return fieldVal !== val;
        if (rule.operator === 'In') {
          return val
            .split(',')
            .map((s) => s.trim())
            .includes(fieldVal);
        }
        return true;
      });
    }

    // Sorting
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
      } else if (sortField === 'Status') {
        valA = a.status;
        valB = b.status;
      } else if (sortField === 'Voucher Type') {
        valA = a.voucherType || '';
        valB = b.voucherType || '';
      } else if (sortField === 'Voucher No') {
        valA = a.voucherNo || '';
        valB = b.voucherNo || '';
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [valuations, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <RepostItemValuationContext.Provider
      value={{
        valuations,
        filteredValuations,
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
        createValuation,
        updateStatus,
        deleteValuations,
      }}
    >
      {children}
    </RepostItemValuationContext.Provider>
  );
};

export const useRepostItemValuation = () => {
  const context = useContext(RepostItemValuationContext);
  if (!context) {
    throw new Error(
      'useRepostItemValuation must be used within a RepostItemValuationProvider'
    );
  }
  return context;
};
