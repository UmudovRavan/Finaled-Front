import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ItemAttributeRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface ItemAttributeContextType {
  attributes: ItemAttributeRecord[];
  filteredAttributes: ItemAttributeRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addAttribute: (attr: Partial<ItemAttributeRecord>) => Promise<ItemAttributeRecord>;
  updateAttribute: (id: string, attr: Partial<ItemAttributeRecord>) => Promise<void>;
  refreshAttributes: () => Promise<void>;
}

const ItemAttributeContext = createContext<ItemAttributeContextType | undefined>(undefined);

export const ItemAttributeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attributes, setAttributes] = useState<ItemAttributeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getItemAttributes();
      setAttributes(data);
    } catch (err) {
      console.error('Failed to load item attributes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAttributes = useMemo(() => {
    return attributes.filter((a) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        const matchId = a.id.toLowerCase().includes(query);
        const matchName = a.attributeName.toLowerCase().includes(query);
        const matchStatus = a.status.toLowerCase().includes(query);
        if (!matchId && !matchName && !matchStatus) return false;
      }
      return true;
    });
  }, [attributes, filterId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAttributes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAttributes.map((a) => a.id));
    }
  };

  const toggleLike = (id: string) => {
    setAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isLiked: !a.isLiked } : a))
    );
  };

  const addAttribute = async (attr: Partial<ItemAttributeRecord>): Promise<ItemAttributeRecord> => {
    const created = await stockService.createItemAttribute(attr);
    setAttributes((prev) => [created, ...prev]);
    return created;
  };

  const updateAttribute = async (id: string, updated: Partial<ItemAttributeRecord>): Promise<void> => {
    setAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated, lastUpdatedOn: new Date().toISOString() } : a))
    );
  };

  return (
    <ItemAttributeContext.Provider
      value={{
        attributes,
        filteredAttributes,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addAttribute,
        updateAttribute,
        refreshAttributes: loadData,
      }}
    >
      {children}
    </ItemAttributeContext.Provider>
  );
};

export const useItemAttribute = () => {
  const context = useContext(ItemAttributeContext);
  if (!context) {
    throw new Error('useItemAttribute must be used within an ItemAttributeProvider');
  }
  return context;
};

