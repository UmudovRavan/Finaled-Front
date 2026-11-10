import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { UOMConversionFactorRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface UOMConversionFactorContextType {
  factors: UOMConversionFactorRecord[];
  filteredFactors: UOMConversionFactorRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterFrom: string;
  setFilterFrom: (val: string) => void;
  filterTo: string;
  setFilterTo: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addConversionFactor: (factor: Partial<UOMConversionFactorRecord>) => Promise<UOMConversionFactorRecord>;
  updateConversionFactor: (id: string, updated: Partial<UOMConversionFactorRecord>) => Promise<void>;
  refreshFactors: () => Promise<void>;
}

const UOMConversionFactorContext = createContext<UOMConversionFactorContextType | undefined>(undefined);

export const UOMConversionFactorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [factors, setFactors] = useState<UOMConversionFactorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getUOMConversionFactors();
      setFactors(data);
    } catch (err) {
      console.error('Failed to load UOM Conversion Factors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFactors = useMemo(() => {
    return factors.filter((f) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (!f.id.toLowerCase().includes(query)) return false;
      }
      if (filterCategory.trim()) {
        const query = filterCategory.toLowerCase().trim();
        if (!f.category.toLowerCase().includes(query)) return false;
      }
      if (filterFrom.trim()) {
        const query = filterFrom.toLowerCase().trim();
        if (!f.fromUOM.toLowerCase().includes(query)) return false;
      }
      if (filterTo.trim()) {
        const query = filterTo.toLowerCase().trim();
        if (!f.toUOM.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [factors, filterId, filterCategory, filterFrom, filterTo]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFactors.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFactors.map((f) => f.id));
    }
  };

  const toggleLike = (id: string) => {
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isLiked: !f.isLiked } : f))
    );
  };

  const addConversionFactor = async (
    factor: Partial<UOMConversionFactorRecord>
  ): Promise<UOMConversionFactorRecord> => {
    const created = await stockService.createUOMConversionFactor(factor);
    setFactors((prev) => [created, ...prev]);
    return created;
  };

  const updateConversionFactor = async (
    id: string,
    updated: Partial<UOMConversionFactorRecord>
  ): Promise<void> => {
    setFactors((prev) =>
      prev.map((f) =>
        f.id.toLowerCase() === id.toLowerCase()
          ? { ...f, ...updated, lastEdited: 'just now' }
          : f
      )
    );
  };

  return (
    <UOMConversionFactorContext.Provider
      value={{
        factors,
        filteredFactors,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterCategory,
        setFilterCategory,
        filterFrom,
        setFilterFrom,
        filterTo,
        setFilterTo,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addConversionFactor,
        updateConversionFactor,
        refreshFactors: loadData,
      }}
    >
      {children}
    </UOMConversionFactorContext.Provider>
  );
};

export const useUOMConversionFactor = (): UOMConversionFactorContextType => {
  const context = useContext(UOMConversionFactorContext);
  if (!context) {
    throw new Error(
      'useUOMConversionFactor must be used within a UOMConversionFactorProvider'
    );
  }
  return context;
};

