import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ItemGroupRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface ItemGroupContextType {
  groups: ItemGroupRecord[];
  filteredGroups: ItemGroupRecord[];
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
  addGroup: (group: Partial<ItemGroupRecord>) => Promise<ItemGroupRecord>;
  updateGroup: (id: string, group: Partial<ItemGroupRecord>) => Promise<void>;
  refreshGroups: () => Promise<void>;
}

const ItemGroupContext = createContext<ItemGroupContextType | undefined>(undefined);

export const ItemGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<ItemGroupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getItemGroups();
      setGroups(data);
    } catch (err) {
      console.error('Failed to load item groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        const matchId = g.id.toLowerCase().includes(query);
        const matchName = g.itemGroupName.toLowerCase().includes(query);
        const matchParent = (g.parentItemGroup || '').toLowerCase().includes(query);
        if (!matchId && !matchName && !matchParent) return false;
      }
      return true;
    });
  }, [groups, filterId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGroups.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGroups.map((g) => g.id));
    }
  };

  const toggleLike = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isLiked: !g.isLiked } : g))
    );
  };

  const addGroup = async (group: Partial<ItemGroupRecord>): Promise<ItemGroupRecord> => {
    const created = await stockService.createItemGroup(group);
    setGroups((prev) => [created, ...prev]);
    return created;
  };

  const updateGroup = async (id: string, updated: Partial<ItemGroupRecord>): Promise<void> => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updated, lastUpdatedOn: new Date().toISOString() } : g))
    );
  };

  return (
    <ItemGroupContext.Provider
      value={{
        groups,
        filteredGroups,
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
        addGroup,
        updateGroup,
        refreshGroups: loadData,
      }}
    >
      {children}
    </ItemGroupContext.Provider>
  );
};

export const useItemGroup = () => {
  const context = useContext(ItemGroupContext);
  if (!context) {
    throw new Error('useItemGroup must be used within an ItemGroupProvider');
  }
  return context;
};

