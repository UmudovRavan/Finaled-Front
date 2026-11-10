import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { WarehouseRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface WarehouseContextType {
  warehouses: WarehouseRecord[];
  filteredWarehouses: WarehouseRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterCompany: string;
  setFilterCompany: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addWarehouse: (wh: Partial<WarehouseRecord>) => Promise<WarehouseRecord>;
  updateWarehouse: (id: string, wh: Partial<WarehouseRecord>) => Promise<void>;
  disableWarehouse: (id: string) => Promise<void>;
  convertToGroup: (id: string) => Promise<void>;
  refreshWarehouses: () => Promise<void>;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getWarehouseRecords();
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to load warehouse records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        const matchId = w.id.toLowerCase().includes(query);
        const matchName = w.warehouseName.toLowerCase().includes(query);
        if (!matchId && !matchName) return false;
      }
      if (filterCompany.trim()) {
        const query = filterCompany.toLowerCase().trim();
        const matchComp = w.company.toLowerCase().includes(query);
        if (!matchComp) return false;
      }
      return true;
    });
  }, [warehouses, filterId, filterCompany]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredWarehouses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredWarehouses.map((w) => w.id));
    }
  };

  const toggleLike = (id: string) => {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLiked: !w.isLiked } : w))
    );
  };

  const addWarehouse = async (wh: Partial<WarehouseRecord>): Promise<WarehouseRecord> => {
    const created = await stockService.createWarehouseRecord(wh);
    setWarehouses((prev) => [created, ...prev]);
    return created;
  };

  const updateWarehouse = async (id: string, updated: Partial<WarehouseRecord>): Promise<void> => {
    setWarehouses((prev) =>
      prev.map((w) =>
        w.id.toLowerCase() === id.toLowerCase()
          ? { ...w, ...updated, lastEdited: 'just now' }
          : w
      )
    );
  };

  const disableWarehouse = async (id: string): Promise<void> => {
    setWarehouses((prev) =>
      prev.map((w) =>
        w.id.toLowerCase() === id.toLowerCase()
          ? {
              ...w,
              status: w.status === 'Enabled' ? 'Disabled' : 'Enabled',
              lastEdited: 'just now',
            }
          : w
      )
    );
  };

  const convertToGroup = async (id: string): Promise<void> => {
    setWarehouses((prev) =>
      prev.map((w) =>
        w.id.toLowerCase() === id.toLowerCase()
          ? {
              ...w,
              isGroupWarehouse: !w.isGroupWarehouse,
              lastEdited: 'just now',
            }
          : w
      )
    );
  };

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        filteredWarehouses,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterCompany,
        setFilterCompany,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addWarehouse,
        updateWarehouse,
        disableWarehouse,
        convertToGroup,
        refreshWarehouses: loadData,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = (): WarehouseContextType => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

