import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { DeliveryTripRecord, DeliveryTripStatus, StockViewMode } from '../types';
import { stockService } from '../api';

interface DeliveryTripContextType {
  trips: DeliveryTripRecord[];
  filteredTrips: DeliveryTripRecord[];
  loading: boolean;
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  filterId: string;
  setFilterId: (val: string) => void;
  filterDriver: string;
  setFilterDriver: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  addTrip: (entry: Partial<DeliveryTripRecord>) => Promise<DeliveryTripRecord>;
  updateTrip: (id: string, updated: Partial<DeliveryTripRecord>) => Promise<void>;
  updateStatus: (id: string, status: DeliveryTripStatus) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
}

const DeliveryTripContext = createContext<DeliveryTripContextType | undefined>(undefined);

export const DeliveryTripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<DeliveryTripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [filterDriver, setFilterDriver] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getDeliveryTrips();
      setTrips(data);
    } catch (err) {
      console.error('Failed to load Delivery Trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTrips = useMemo(() => {
    return trips.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        if (!item.id.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterDriver.trim()) {
        const query = filterDriver.toLowerCase().trim();
        if (!item.driver.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterStatus.trim()) {
        if (item.status !== filterStatus) {
          return false;
        }
      }
      return true;
    });
  }, [trips, filterId, filterDriver, filterStatus]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTrips.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTrips.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setTrips((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addTrip = async (entry: Partial<DeliveryTripRecord>): Promise<DeliveryTripRecord> => {
    const created = await stockService.createDeliveryTrip(entry);
    setTrips((prev) => [created, ...prev]);
    return created;
  };

  const updateTrip = async (id: string, updated: Partial<DeliveryTripRecord>) => {
    setTrips((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const updateStatus = async (id: string, status: DeliveryTripStatus) => {
    setTrips((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, lastEdited: 'just now' } : item))
    );
  };

  const deleteTrip = async (id: string) => {
    setTrips((prev) => prev.filter((item) => item.id !== id));
  };

  const refreshTrips = async () => {
    await loadData();
  };

  return (
    <DeliveryTripContext.Provider
      value={{
        trips,
        filteredTrips,
        loading,
        viewMode,
        setViewMode,
        filterId,
        setFilterId,
        filterDriver,
        setFilterDriver,
        filterStatus,
        setFilterStatus,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        pageSize,
        setPageSize,
        addTrip,
        updateTrip,
        updateStatus,
        deleteTrip,
        refreshTrips,
      }}
    >
      {children}
    </DeliveryTripContext.Provider>
  );
};

export const useDeliveryTrip = () => {
  const context = useContext(DeliveryTripContext);
  if (!context) {
    throw new Error('useDeliveryTrip must be used within a DeliveryTripProvider');
  }
  return context;
};

