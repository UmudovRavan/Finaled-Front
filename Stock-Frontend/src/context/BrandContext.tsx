import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { BrandRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface BrandContextType {
  brands: BrandRecord[];
  filteredBrands: BrandRecord[];
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
  addBrand: (brand: Partial<BrandRecord>) => Promise<BrandRecord>;
  updateBrand: (id: string, brand: Partial<BrandRecord>) => Promise<void>;
  refreshBrands: () => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brands, setBrands] = useState<BrandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getBrands();
      setBrands(data);
    } catch (err) {
      console.error('Failed to load brands', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        const matchId = b.id.toLowerCase().includes(query);
        const matchName = b.brandName.toLowerCase().includes(query);
        const matchDesc = (b.description || '').toLowerCase().includes(query);
        if (!matchId && !matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [brands, filterId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBrands.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBrands.map((b) => b.id));
    }
  };

  const toggleLike = (id: string) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isLiked: !b.isLiked } : b))
    );
  };

  const addBrand = async (brand: Partial<BrandRecord>): Promise<BrandRecord> => {
    const created = await stockService.createBrand(brand);
    setBrands((prev) => [created, ...prev]);
    return created;
  };

  const updateBrand = async (id: string, updated: Partial<BrandRecord>): Promise<void> => {
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated, lastUpdatedOn: new Date().toISOString() } : b))
    );
  };

  return (
    <BrandContext.Provider
      value={{
        brands,
        filteredBrands,
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
        addBrand,
        updateBrand,
        refreshBrands: loadData,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};

