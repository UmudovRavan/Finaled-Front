import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import type {
  PackingSlipRecord,
  PackingSlipStatus,
  StockViewMode,
  FilterRule,
} from '../types';
import { stockService, INITIAL_PACKING_SLIPS } from '../api';

interface PackingSlipQuickFiltersState {
  id: string;
  deliveryNote: string;
}

interface PackingSlipContextType {
  slips: PackingSlipRecord[];
  filteredSlips: PackingSlipRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  quickFilters: PackingSlipQuickFiltersState;
  setQuickFilters: React.Dispatch<
    React.SetStateAction<PackingSlipQuickFiltersState>
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
  createSlip: (
    data: Partial<PackingSlipRecord>
  ) => Promise<PackingSlipRecord>;
  updateStatus: (id: string, status: PackingSlipStatus) => void;
  deleteSlips: (ids: string[]) => void;
}

const PackingSlipContext = createContext<PackingSlipContextType | undefined>(
  undefined
);

export const PackingSlipProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [slips, setSlips] = useState<PackingSlipRecord[]>(() => {
    const saved = localStorage.getItem('altensor_packing_slips');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PACKING_SLIPS;
      }
    }
    return INITIAL_PACKING_SLIPS;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [sortField, setSortField] = useState('Created On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [quickFilters, setQuickFilters] = useState<PackingSlipQuickFiltersState>(
    {
      id: '',
      deliveryNote: '',
    }
  );

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

  useEffect(() => {
    localStorage.setItem('altensor_packing_slips', JSON.stringify(slips));
  }, [slips]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getPackingSlips();
      if (data && data.length > 0) {
        setSlips(data);
      }
    } catch (err) {
      console.error('Failed to refresh packing slips:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const createSlip = async (
    data: Partial<PackingSlipRecord>
  ): Promise<PackingSlipRecord> => {
    const res = await stockService.createPackingSlip(data);
    setSlips((prev) => [res, ...prev]);
    return res;
  };

  const updateStatus = (id: string, status: PackingSlipStatus) => {
    setSlips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const deleteSlips = (ids: string[]) => {
    setSlips((prev) => prev.filter((s) => !ids.includes(s.id)));
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSlips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSlips.map((s) => s.id));
    }
  };

  const toggleLike = (id: string) => {
    setSlips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isLiked: !s.isLiked } : s))
    );
  };

  const filteredSlips = useMemo(() => {
    let result = [...slips];

    // Quick filters
    if (quickFilters.id.trim()) {
      const q = quickFilters.id.toLowerCase().trim();
      result = result.filter((s) => s.id.toLowerCase().includes(q));
    }
    if (quickFilters.deliveryNote.trim()) {
      const q = quickFilters.deliveryNote.toLowerCase().trim();
      result = result.filter((s) =>
        s.deliveryNote.toLowerCase().includes(q)
      );
    }

    // Saved filter
    if (savedFilter !== 'All') {
      result = result.filter((s) => s.status === savedFilter);
    }

    // Advanced rules
    for (const rule of filterRules) {
      if (!rule.value.trim()) continue;
      const val = rule.value.toLowerCase().trim();

      result = result.filter((s) => {
        let fieldVal = '';
        if (rule.field === 'ID') fieldVal = s.id;
        else if (rule.field === 'Status') fieldVal = s.status;
        else if (rule.field === 'Delivery Note') fieldVal = s.deliveryNote;
        else if (rule.field === 'From Package No')
          fieldVal = String(s.fromPackageNo);
        else if (rule.field === 'To Package No')
          fieldVal = String(s.toPackageNo);

        fieldVal = fieldVal.toLowerCase();

        if (rule.operator === 'Equals') return fieldVal === val;
        if (rule.operator === 'Like') return fieldVal.includes(val);
        if (rule.operator === '!=') return fieldVal !== val;
        if (rule.operator === 'In') {
          return val
            .split(',')
            .map((item) => item.trim())
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
      } else if (sortField === 'Delivery Note') {
        valA = a.deliveryNote;
        valB = b.deliveryNote;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [slips, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <PackingSlipContext.Provider
      value={{
        slips,
        filteredSlips,
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
        createSlip,
        updateStatus,
        deleteSlips,
      }}
    >
      {children}
    </PackingSlipContext.Provider>
  );
};

export const usePackingSlip = () => {
  const context = useContext(PackingSlipContext);
  if (!context) {
    throw new Error('usePackingSlip must be used within a PackingSlipProvider');
  }
  return context;
};

