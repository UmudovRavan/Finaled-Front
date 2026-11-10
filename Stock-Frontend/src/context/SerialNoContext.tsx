import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { SerialNoRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface SerialNoContextType {
  serialNos: SerialNoRecord[];
  filteredSerialNos: SerialNoRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterItemCode: string;
  setFilterItemCode: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterCompany: string;
  setFilterCompany: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addSerialNo: (entry: Partial<SerialNoRecord>) => Promise<SerialNoRecord>;
  updateSerialNo: (id: string, updated: Partial<SerialNoRecord>) => Promise<void>;
  refreshSerialNos: () => Promise<void>;
}

const SerialNoContext = createContext<SerialNoContextType | undefined>(undefined);

export const SerialNoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serialNos, setSerialNos] = useState<SerialNoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterItemCode, setFilterItemCode] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getSerialNos();
      setSerialNos(data);
    } catch (err) {
      console.error('Failed to load Serial Nos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSerialNos = useMemo(() => {
    return serialNos.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (!item.id.toLowerCase().includes(query) && !item.serialNo.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterItemCode.trim()) {
        const query = filterItemCode.toLowerCase().trim();
        if (!item.itemCode.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterStatus.trim()) {
        if (item.status.toLowerCase() !== filterStatus.toLowerCase().trim()) {
          return false;
        }
      }
      if (filterCompany.trim()) {
        const query = filterCompany.toLowerCase().trim();
        if (!item.company.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [serialNos, filterId, filterItemCode, filterStatus, filterCompany]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSerialNos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSerialNos.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setSerialNos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addSerialNo = async (entry: Partial<SerialNoRecord>): Promise<SerialNoRecord> => {
    const created = await stockService.createSerialNo(entry);
    setSerialNos((prev) => [created, ...prev]);
    return created;
  };

  const updateSerialNo = async (id: string, updated: Partial<SerialNoRecord>) => {
    setSerialNos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const refreshSerialNos = async () => {
    await loadData();
  };

  return (
    <SerialNoContext.Provider
      value={{
        serialNos,
        filteredSerialNos,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterItemCode,
        setFilterItemCode,
        filterStatus,
        setFilterStatus,
        filterCompany,
        setFilterCompany,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addSerialNo,
        updateSerialNo,
        refreshSerialNos,
      }}
    >
      {children}
    </SerialNoContext.Provider>
  );
};

export const useSerialNo = () => {
  const context = useContext(SerialNoContext);
  if (!context) {
    throw new Error('useSerialNo must be used within a SerialNoProvider');
  }
  return context;
};

