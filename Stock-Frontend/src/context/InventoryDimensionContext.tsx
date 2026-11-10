import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { InventoryDimensionRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface InventoryDimensionContextType {
  dimensions: InventoryDimensionRecord[];
  filteredDimensions: InventoryDimensionRecord[];
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
  addDimension: (entry: Partial<InventoryDimensionRecord>) => Promise<InventoryDimensionRecord>;
  updateDimension: (id: string, updated: Partial<InventoryDimensionRecord>) => Promise<void>;
  deleteDimension: (id: string) => Promise<void>;
  refreshDimensions: () => Promise<void>;
}

const InventoryDimensionContext = createContext<InventoryDimensionContextType | undefined>(undefined);

export const InventoryDimensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dimensions, setDimensions] = useState<InventoryDimensionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getInventoryDimensions();
      setDimensions(data);
    } catch (err) {
      console.error('Failed to load Inventory Dimensions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDimensions = useMemo(() => {
    return dimensions.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (!item.id.toLowerCase().includes(query) && !item.dimensionName.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [dimensions, filterId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDimensions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDimensions.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setDimensions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addDimension = async (entry: Partial<InventoryDimensionRecord>): Promise<InventoryDimensionRecord> => {
    const created = await stockService.createInventoryDimension(entry);
    setDimensions((prev) => [created, ...prev]);
    return created;
  };

  const updateDimension = async (id: string, updated: Partial<InventoryDimensionRecord>) => {
    setDimensions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const deleteDimension = async (id: string) => {
    setDimensions((prev) => prev.filter((item) => item.id !== id));
  };

  const refreshDimensions = async () => {
    await loadData();
  };

  return (
    <InventoryDimensionContext.Provider
      value={{
        dimensions,
        filteredDimensions,
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
        addDimension,
        updateDimension,
        deleteDimension,
        refreshDimensions,
      }}
    >
      {children}
    </InventoryDimensionContext.Provider>
  );
};

export const useInventoryDimension = () => {
  const context = useContext(InventoryDimensionContext);
  if (!context) {
    throw new Error('useInventoryDimension must be used within an InventoryDimensionProvider');
  }
  return context;
};

