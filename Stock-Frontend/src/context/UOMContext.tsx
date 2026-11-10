import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { UOMRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface UOMContextType {
  uoms: UOMRecord[];
  filteredUOMs: UOMRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addUOM: (uom: Partial<UOMRecord>) => Promise<UOMRecord>;
  updateUOM: (id: string, updated: Partial<UOMRecord>) => Promise<void>;
  refreshUOMs: () => Promise<void>;
}

const UOMContext = createContext<UOMContextType | undefined>(undefined);

export const UOMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uoms, setUoms] = useState<UOMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getUOMRecords();
      setUoms(data);
    } catch (err) {
      console.error('Failed to load UOM records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUOMs = useMemo(() => {
    return uoms.filter((u) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        const matchId = u.id.toLowerCase().includes(query);
        const matchName = u.uomName.toLowerCase().includes(query);
        if (!matchId && !matchName) return false;
      }
      if (filterCategory.trim()) {
        const query = filterCategory.toLowerCase().trim();
        const matchCat = (u.category || '').toLowerCase().includes(query);
        if (!matchCat) return false;
      }
      return true;
    });
  }, [uoms, filterId, filterCategory]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUOMs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUOMs.map((u) => u.id));
    }
  };

  const toggleLike = (id: string) => {
    setUoms((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isLiked: !u.isLiked } : u))
    );
  };

  const addUOM = async (uom: Partial<UOMRecord>): Promise<UOMRecord> => {
    const created = await stockService.createUOMRecord(uom);
    setUoms((prev) => [created, ...prev]);
    return created;
  };

  const updateUOM = async (id: string, updated: Partial<UOMRecord>): Promise<void> => {
    setUoms((prev) =>
      prev.map((u) =>
        u.id.toLowerCase() === id.toLowerCase()
          ? { ...u, ...updated, lastEdited: 'just now' }
          : u
      )
    );
  };

  return (
    <UOMContext.Provider
      value={{
        uoms,
        filteredUOMs,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterCategory,
        setFilterCategory,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addUOM,
        updateUOM,
        refreshUOMs: loadData,
      }}
    >
      {children}
    </UOMContext.Provider>
  );
};

export const useUOM = (): UOMContextType => {
  const context = useContext(UOMContext);
  if (!context) {
    throw new Error('useUOM must be used within a UOMProvider');
  }
  return context;
};

