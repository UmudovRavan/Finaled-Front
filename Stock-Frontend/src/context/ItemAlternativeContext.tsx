import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ItemAlternativeRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface ItemAlternativeContextType {
  alternatives: ItemAlternativeRecord[];
  filteredAlternatives: ItemAlternativeRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterItemCode: string;
  setFilterItemCode: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addAlternative: (entry: Partial<ItemAlternativeRecord>) => Promise<ItemAlternativeRecord>;
  updateAlternative: (id: string, updated: Partial<ItemAlternativeRecord>) => Promise<void>;
  deleteAlternative: (id: string) => Promise<void>;
  refreshAlternatives: () => Promise<void>;
}

const ItemAlternativeContext = createContext<ItemAlternativeContextType | undefined>(undefined);

export const ItemAlternativeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alternatives, setAlternatives] = useState<ItemAlternativeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterItemCode, setFilterItemCode] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getItemAlternatives();
      setAlternatives(data);
    } catch (err) {
      console.error('Failed to load Item Alternatives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAlternatives = useMemo(() => {
    return alternatives.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (
          !item.id.toLowerCase().includes(query) &&
          !item.itemCode.toLowerCase().includes(query) &&
          !item.alternativeItemCode.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filterItemCode.trim()) {
        const query = filterItemCode.toLowerCase().trim();
        if (!item.itemCode.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [alternatives, filterId, filterItemCode]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAlternatives.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlternatives.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setAlternatives((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addAlternative = async (entry: Partial<ItemAlternativeRecord>): Promise<ItemAlternativeRecord> => {
    const created = await stockService.createItemAlternative(entry);
    setAlternatives((prev) => [created, ...prev]);
    return created;
  };

  const updateAlternative = async (id: string, updated: Partial<ItemAlternativeRecord>) => {
    setAlternatives((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const deleteAlternative = async (id: string) => {
    setAlternatives((prev) => prev.filter((item) => item.id !== id));
  };

  const refreshAlternatives = async () => {
    await loadData();
  };

  return (
    <ItemAlternativeContext.Provider
      value={{
        alternatives,
        filteredAlternatives,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterItemCode,
        setFilterItemCode,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addAlternative,
        updateAlternative,
        deleteAlternative,
        refreshAlternatives,
      }}
    >
      {children}
    </ItemAlternativeContext.Provider>
  );
};

export const useItemAlternative = () => {
  const context = useContext(ItemAlternativeContext);
  if (!context) {
    throw new Error('useItemAlternative must be used within an ItemAlternativeProvider');
  }
  return context;
};

