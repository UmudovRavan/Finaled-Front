import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ItemRecord, StockViewMode, FilterRule } from '../types';
import { stockService } from '../api';

interface ItemQuickFilters {
  id: string;
  itemName: string;
  itemGroup: string;
  variantOf: string;
  hasVariants: boolean;
}

interface ItemContextType {
  items: ItemRecord[];
  filteredItems: ItemRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  quickFilters: ItemQuickFilters;
  setQuickFilters: React.Dispatch<React.SetStateAction<ItemQuickFilters>>;
  filterRules: FilterRule[];
  setFilterRules: React.Dispatch<React.SetStateAction<FilterRule[]>>;
  isFilterPopoverOpen: boolean;
  setIsFilterPopoverOpen: (open: boolean) => void;
  isNewItemModalOpen: boolean;
  setIsNewItemModalOpen: (open: boolean) => void;
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
  addItem: (item: Partial<ItemRecord>) => Promise<ItemRecord>;
  refreshItems: () => Promise<void>;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  const [quickFilters, setQuickFilters] = useState<ItemQuickFilters>({
    id: '',
    itemName: '',
    itemGroup: '',
    variantOf: '',
    hasVariants: false,
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [sortField, setSortField] = useState('Created On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (
        quickFilters.id &&
        !item.id.toLowerCase().includes(quickFilters.id.toLowerCase())
      ) {
        return false;
      }
      if (
        quickFilters.itemName &&
        !item.itemName.toLowerCase().includes(quickFilters.itemName.toLowerCase())
      ) {
        return false;
      }
      if (
        quickFilters.itemGroup &&
        !item.itemGroup.toLowerCase().includes(quickFilters.itemGroup.toLowerCase())
      ) {
        return false;
      }
      if (
        quickFilters.variantOf &&
        !(item.variantOf || '').toLowerCase().includes(quickFilters.variantOf.toLowerCase())
      ) {
        return false;
      }
      if (quickFilters.hasVariants && !item.hasVariants) {
        return false;
      }

      // Advanced filter rules
      for (const rule of filterRules) {
        if (!rule.value) continue;
        const targetVal = String((item as any)[rule.field] ?? '').toLowerCase();
        const ruleVal = rule.value.toLowerCase();

        if (rule.operator === 'Equals' && targetVal !== ruleVal) return false;
        if (rule.operator === 'Like' && !targetVal.includes(ruleVal)) return false;
        if (rule.operator === 'In' && !ruleVal.split(',').map((s) => s.trim()).includes(targetVal)) return false;
        if (rule.operator === '!=' && targetVal === ruleVal) return false;
      }

      return true;
    });
  }, [items, quickFilters, filterRules]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isLiked: !item.isLiked } : item
      )
    );
  };

  const addItem = async (newItemData: Partial<ItemRecord>): Promise<ItemRecord> => {
    const created = await stockService.createItem(newItemData);
    setItems((prev) => [created, ...prev]);
    return created;
  };

  const refreshItems = async () => {
    await loadData();
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        filteredItems,
        loading,
        viewMode,
        setViewMode,
        quickFilters,
        setQuickFilters,
        filterRules,
        setFilterRules,
        isFilterPopoverOpen,
        setIsFilterPopoverOpen,
        isNewItemModalOpen,
        setIsNewItemModalOpen,
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
        addItem,
        refreshItems,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export const useItem = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItem must be used within an ItemProvider');
  }
  return context;
};
