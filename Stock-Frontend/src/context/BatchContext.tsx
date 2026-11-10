import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { BatchRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface BatchContextType {
  batches: BatchRecord[];
  filteredBatches: BatchRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterBatchId: string;
  setFilterBatchId: (val: string) => void;
  filterItem: string;
  setFilterItem: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addBatch: (entry: Partial<BatchRecord>) => Promise<BatchRecord>;
  updateBatch: (id: string, updated: Partial<BatchRecord>) => Promise<void>;
  refreshBatches: () => Promise<void>;
}

const BatchContext = createContext<BatchContextType | undefined>(undefined);

export const BatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterBatchId, setFilterBatchId] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getBatches();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load Batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBatches = useMemo(() => {
    return batches.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (!item.id.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterBatchId.trim()) {
        const query = filterBatchId.toLowerCase().trim();
        if (!item.batchId.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterItem.trim()) {
        const query = filterItem.toLowerCase().trim();
        if (!item.item.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [batches, filterId, filterBatchId, filterItem]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBatches.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBatches.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setBatches((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addBatch = async (entry: Partial<BatchRecord>): Promise<BatchRecord> => {
    const created = await stockService.createBatch(entry);
    setBatches((prev) => [created, ...prev]);
    return created;
  };

  const updateBatch = async (id: string, updated: Partial<BatchRecord>) => {
    setBatches((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const refreshBatches = async () => {
    await loadData();
  };

  return (
    <BatchContext.Provider
      value={{
        batches,
        filteredBatches,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterBatchId,
        setFilterBatchId,
        filterItem,
        setFilterItem,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addBatch,
        updateBatch,
        refreshBatches,
      }}
    >
      {children}
    </BatchContext.Provider>
  );
};

export const useBatch = () => {
  const context = useContext(BatchContext);
  if (!context) {
    throw new Error('useBatch must be used within a BatchProvider');
  }
  return context;
};

