import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ShippingRuleRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface ShippingRuleContextType {
  shippingRules: ShippingRuleRecord[];
  filteredShippingRules: ShippingRuleRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterCalculateBasedOn: string;
  setFilterCalculateBasedOn: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addShippingRule: (entry: Partial<ShippingRuleRecord>) => Promise<ShippingRuleRecord>;
  updateShippingRule: (id: string, updated: Partial<ShippingRuleRecord>) => Promise<void>;
  deleteShippingRule: (id: string) => Promise<void>;
  refreshShippingRules: () => Promise<void>;
}

const ShippingRuleContext = createContext<ShippingRuleContextType | undefined>(undefined);

export const ShippingRuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingRules, setShippingRules] = useState<ShippingRuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterCalculateBasedOn, setFilterCalculateBasedOn] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getShippingRules();
      setShippingRules(data);
    } catch (err) {
      console.error('Failed to load Shipping Rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredShippingRules = useMemo(() => {
    return shippingRules.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (
          !item.id.toLowerCase().includes(query) &&
          !item.shippingRuleLabel.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filterCalculateBasedOn.trim()) {
        if (item.calculateBasedOn !== filterCalculateBasedOn) {
          return false;
        }
      }
      return true;
    });
  }, [shippingRules, filterId, filterCalculateBasedOn]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShippingRules.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredShippingRules.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setShippingRules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addShippingRule = async (entry: Partial<ShippingRuleRecord>): Promise<ShippingRuleRecord> => {
    const created = await stockService.createShippingRule(entry);
    setShippingRules((prev) => [created, ...prev]);
    return created;
  };

  const updateShippingRule = async (id: string, updated: Partial<ShippingRuleRecord>) => {
    setShippingRules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const deleteShippingRule = async (id: string) => {
    setShippingRules((prev) => prev.filter((item) => item.id !== id));
  };

  const refreshShippingRules = async () => {
    await loadData();
  };

  return (
    <ShippingRuleContext.Provider
      value={{
        shippingRules,
        filteredShippingRules,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterCalculateBasedOn,
        setFilterCalculateBasedOn,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addShippingRule,
        updateShippingRule,
        deleteShippingRule,
        refreshShippingRules,
      }}
    >
      {children}
    </ShippingRuleContext.Provider>
  );
};

export const useShippingRule = () => {
  const context = useContext(ShippingRuleContext);
  if (!context) {
    throw new Error('useShippingRule must be used within a ShippingRuleProvider');
  }
  return context;
};

