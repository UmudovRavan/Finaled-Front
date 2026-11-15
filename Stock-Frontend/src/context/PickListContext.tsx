import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type {
  PickListRecord,
  PickListStatus,
  StockViewMode,
  FilterRule,
} from '../types';
import { stockService } from '../api';

interface PickListQuickFiltersState {
  id: string;
  deliveryStatus: string;
  status: string;
}

interface PickListContextType {
  pickLists: PickListRecord[];
  filteredPickLists: PickListRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectedPickList: PickListRecord | null;
  setSelectedPickList: (pl: PickListRecord | null) => void;
  quickFilters: PickListQuickFiltersState;
  setQuickFilters: React.Dispatch<React.SetStateAction<PickListQuickFiltersState>>;
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
  createPickList: (data: Partial<PickListRecord>) => Promise<PickListRecord>;
  updateStatus: (id: string, status: PickListStatus) => void;
  deletePickLists: (ids: string[]) => void;
}

const PickListContext = createContext<PickListContextType | undefined>(undefined);

export const PickListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pickLists, setPickLists] = useState<PickListRecord[]>([]);

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPickList, setSelectedPickList] = useState<PickListRecord | null>(null);

  const [quickFilters, setQuickFilters] = useState<PickListQuickFiltersState>({
    id: '',
    deliveryStatus: '',
    status: '',
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [sortField, setSortField] = useState<string>('Last Updated On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getPickLists();
      setPickLists(data);
    } catch (err) {
      console.error('Failed to load pick lists', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPickLists.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPickLists.map((e) => e.id));
    }
  };

  const toggleLike = (id: string) => {
    setPickLists((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isLiked: !e.isLiked } : e))
    );
  };

  const createPickList = async (data: Partial<PickListRecord>) => {
    const created = await stockService.createPickList(data);
    setPickLists((prev) => [created, ...prev]);
    return created;
  };

  const updateStatus = async (id: string, status: PickListStatus) => {
    try {
      const updated =
        status === 'Open' || status === 'Completed'
          ? await stockService.submitPickList(id)
          : status === 'Cancelled'
          ? await stockService.cancelPickList(id)
          : null;
      if (updated) {
        setPickLists((prev) => prev.map((e) => (e.id === id ? updated : e)));
        return;
      }
    } catch (err) {
      console.error('Failed to update pick list status', err);
    }
  };

  const deletePickLists = (ids: string[]) => {
    setPickLists((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const filteredPickLists = useMemo(() => {
    let result = [...pickLists];

    if (quickFilters.id.trim()) {
      const q = quickFilters.id.toLowerCase().trim();
      result = result.filter((e) => e.id.toLowerCase().includes(q));
    }
    if (quickFilters.deliveryStatus.trim()) {
      const q = quickFilters.deliveryStatus.toLowerCase().trim();
      result = result.filter((e) => (e.deliveryStatus || '').toLowerCase() === q);
    }
    if (quickFilters.status.trim()) {
      const q = quickFilters.status.toLowerCase().trim();
      result = result.filter((e) => e.status.toLowerCase() === q);
    }

    if (savedFilter !== 'All') {
      result = result.filter(
        (e) => e.status === savedFilter || e.deliveryStatus === savedFilter
      );
    }

    for (const rule of filterRules) {
      if (!rule.value.trim()) continue;
      const val = rule.value.toLowerCase().trim();

      result = result.filter((e) => {
        let fieldVal = '';
        if (rule.field === 'ID') fieldVal = e.id;
        else if (rule.field === 'Status') fieldVal = e.status;
        else if (rule.field === 'Delivery Status') fieldVal = e.deliveryStatus || '';
        else if (rule.field === 'Company') fieldVal = e.company;
        else if (rule.field === 'Customer') fieldVal = e.customer;

        fieldVal = fieldVal.toLowerCase();

        if (rule.operator === 'Equals') return fieldVal === val;
        if (rule.operator === 'Like') return fieldVal.includes(val);
        if (rule.operator === '!=') return fieldVal !== val;
        if (rule.operator === 'In') return val.split(',').map((s) => s.trim()).includes(fieldVal);
        return true;
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'ID') cmp = a.id.localeCompare(b.id);
      else if (sortField === 'Status') cmp = a.status.localeCompare(b.status);
      else if (sortField === 'Company') cmp = a.company.localeCompare(b.company);
      else if (sortField === 'Customer') cmp = a.customer.localeCompare(b.customer);
      else if (sortField === 'Last Updated On') {
        cmp = new Date(a.lastUpdatedOn).getTime() - new Date(b.lastUpdatedOn).getTime();
      } else {
        cmp = new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime();
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [pickLists, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <PickListContext.Provider
      value={{
        pickLists,
        filteredPickLists,
        viewMode,
        setViewMode,
        savedFilter,
        setSavedFilter,
        isAddModalOpen,
        setIsAddModalOpen,
        selectedPickList,
        setSelectedPickList,
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
        createPickList,
        updateStatus,
        deletePickLists,
      }}
    >
      {children}
    </PickListContext.Provider>
  );
};

export const usePickList = () => {
  const context = useContext(PickListContext);
  if (!context) {
    throw new Error('usePickList must be used within a PickListProvider');
  }
  return context;
};

