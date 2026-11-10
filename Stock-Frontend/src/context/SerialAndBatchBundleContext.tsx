import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { SerialAndBatchBundleRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface SerialAndBatchBundleContextType {
  bundles: SerialAndBatchBundleRecord[];
  filteredBundles: SerialAndBatchBundleRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterItemCode: string;
  setFilterItemCode: (val: string) => void;
  filterWarehouse: string;
  setFilterWarehouse: (val: string) => void;
  filterVoucherNo: string;
  setFilterVoucherNo: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addBundle: (entry: Partial<SerialAndBatchBundleRecord>) => Promise<SerialAndBatchBundleRecord>;
  updateBundle: (id: string, updated: Partial<SerialAndBatchBundleRecord>) => Promise<void>;
  refreshBundles: () => Promise<void>;
}

const SerialAndBatchBundleContext = createContext<SerialAndBatchBundleContextType | undefined>(undefined);

export const SerialAndBatchBundleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bundles, setBundles] = useState<SerialAndBatchBundleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterItemCode, setFilterItemCode] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterVoucherNo, setFilterVoucherNo] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getSerialAndBatchBundles();
      setBundles(data);
    } catch (err) {
      console.error('Failed to load Serial and Batch Bundles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBundles = useMemo(() => {
    return bundles.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (!item.id.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterItemCode.trim()) {
        const query = filterItemCode.toLowerCase().trim();
        if (!item.itemCode.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterWarehouse.trim()) {
        const query = filterWarehouse.toLowerCase().trim();
        if (!item.warehouse.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterVoucherNo.trim()) {
        const query = filterVoucherNo.toLowerCase().trim();
        if (!item.voucherNo?.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [bundles, filterId, filterItemCode, filterWarehouse, filterVoucherNo]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBundles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBundles.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setBundles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addBundle = async (entry: Partial<SerialAndBatchBundleRecord>): Promise<SerialAndBatchBundleRecord> => {
    const created = await stockService.createSerialAndBatchBundle(entry);
    setBundles((prev) => [created, ...prev]);
    return created;
  };

  const updateBundle = async (id: string, updated: Partial<SerialAndBatchBundleRecord>) => {
    setBundles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const refreshBundles = async () => {
    await loadData();
  };

  return (
    <SerialAndBatchBundleContext.Provider
      value={{
        bundles,
        filteredBundles,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterItemCode,
        setFilterItemCode,
        filterWarehouse,
        setFilterWarehouse,
        filterVoucherNo,
        setFilterVoucherNo,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addBundle,
        updateBundle,
        refreshBundles,
      }}
    >
      {children}
    </SerialAndBatchBundleContext.Provider>
  );
};

export const useSerialAndBatchBundle = () => {
  const context = useContext(SerialAndBatchBundleContext);
  if (!context) {
    throw new Error('useSerialAndBatchBundle must be used within a SerialAndBatchBundleProvider');
  }
  return context;
};

