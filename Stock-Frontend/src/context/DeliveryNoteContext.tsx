import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { DeliveryNoteRecord, DeliveryNoteStatus, StockViewMode, FilterRule } from '../types';
import { stockService, INITIAL_DELIVERY_NOTES } from '../api';

interface DeliveryNoteQuickFiltersState {
  id: string;
  customer: string;
  customerName: string;
  company: string;
  setTargetWarehouse: string;
  status: string;
}

interface DeliveryNoteContextType {
  notes: DeliveryNoteRecord[];
  filteredNotes: DeliveryNoteRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectedNote: DeliveryNoteRecord | null;
  setSelectedNote: (note: DeliveryNoteRecord | null) => void;
  quickFilters: DeliveryNoteQuickFiltersState;
  setQuickFilters: React.Dispatch<React.SetStateAction<DeliveryNoteQuickFiltersState>>;
  filterRules: FilterRule[];
  setFilterRules: React.Dispatch<React.SetStateAction<FilterRule[]>>;
  isFilterPopoverOpen: boolean;
  setIsFilterPopoverOpen: (open: boolean) => void;
  sortField: string;
  setSortField: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  toggleLike: (id: string) => void;
  refresh: () => void;
  isRefreshing: boolean;
  createNote: (data: Partial<DeliveryNoteRecord>) => Promise<DeliveryNoteRecord>;
  updateStatus: (id: string, status: DeliveryNoteStatus) => void;
  deleteNotes: (ids: string[]) => void;
}

const DeliveryNoteContext = createContext<DeliveryNoteContextType | undefined>(undefined);

export const DeliveryNoteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<DeliveryNoteRecord[]>(() => {
    const saved = localStorage.getItem('altensor_delivery_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DELIVERY_NOTES;
      }
    }
    return INITIAL_DELIVERY_NOTES;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<DeliveryNoteRecord | null>(null);

  const [quickFilters, setQuickFilters] = useState<DeliveryNoteQuickFiltersState>({
    id: '',
    customer: '',
    customerName: '',
    company: '',
    setTargetWarehouse: '',
    status: '',
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [sortField, setSortField] = useState<string>('Created On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem('altensor_delivery_notes', JSON.stringify(notes));
  }, [notes]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getDeliveryNotes();
      if (data && data.length > 0) {
        setNotes(data);
      }
    } catch {
      // Keep existing data
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotes.map((e) => e.id));
    }
  };

  const toggleLike = (id: string) => {
    setNotes((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isLiked: !e.isLiked } : e))
    );
  };

  const createNote = async (data: Partial<DeliveryNoteRecord>) => {
    const created = await stockService.createDeliveryNote(data);
    setNotes((prev) => [created, ...prev]);
    return created;
  };

  const updateStatus = (id: string, status: DeliveryNoteStatus) => {
    setNotes((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              perAmountBilled: status === 'Completed' ? 100 : e.perAmountBilled,
              lastUpdatedOn: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const deleteNotes = (ids: string[]) => {
    setNotes((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  // Filter & sort logic
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Quick filters from Image 1 & 2: ID ≈, Customer, Customer Name ≈, Company, Set Target Warehouse, Status
    if (quickFilters.id.trim()) {
      const q = quickFilters.id.toLowerCase().trim();
      result = result.filter((e) => e.id.toLowerCase().includes(q));
    }
    if (quickFilters.customer.trim()) {
      const q = quickFilters.customer.toLowerCase().trim();
      result = result.filter((e) => (e.customer || e.customerName).toLowerCase().includes(q));
    }
    if (quickFilters.customerName.trim()) {
      const q = quickFilters.customerName.toLowerCase().trim();
      result = result.filter((e) => e.customerName.toLowerCase().includes(q));
    }
    if (quickFilters.company.trim()) {
      const q = quickFilters.company.toLowerCase().trim();
      result = result.filter((e) => e.company.toLowerCase().includes(q));
    }
    if (quickFilters.setTargetWarehouse.trim()) {
      const q = quickFilters.setTargetWarehouse.toLowerCase().trim();
      result = result.filter((e) => (e.setTargetWarehouse || '').toLowerCase().includes(q));
    }
    if (quickFilters.status.trim()) {
      const q = quickFilters.status.toLowerCase().trim();
      result = result.filter((e) => e.status.toLowerCase() === q);
    }

    // Saved Filter
    if (savedFilter !== 'All') {
      result = result.filter((e) => e.status === savedFilter);
    }

    // Advanced Filter Rules
    for (const rule of filterRules) {
      if (!rule.value.trim()) continue;
      const val = rule.value.toLowerCase().trim();

      result = result.filter((e) => {
        let fieldVal = '';
        if (rule.field === 'ID') fieldVal = e.id;
        else if (rule.field === 'Customer') fieldVal = e.customer || e.customerName;
        else if (rule.field === 'Customer Name') fieldVal = e.customerName;
        else if (rule.field === 'Status') fieldVal = e.status;
        else if (rule.field === 'Company') fieldVal = e.company;
        else if (rule.field === 'Set Target Warehouse') fieldVal = e.setTargetWarehouse || '';
        else if (rule.field === 'Date') fieldVal = e.date;
        else if (rule.field === 'Grand Total') fieldVal = String(e.grandTotal);

        fieldVal = fieldVal.toLowerCase();

        if (rule.operator === 'Equals') return fieldVal === val;
        if (rule.operator === 'Like') return fieldVal.includes(val);
        if (rule.operator === '!=') return fieldVal !== val;
        if (rule.operator === 'In') return val.split(',').map((s) => s.trim()).includes(fieldVal);
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a.createdOn;
      let valB: any = b.createdOn;

      if (sortField === 'Created On') {
        valA = new Date(a.createdOn).getTime();
        valB = new Date(b.createdOn).getTime();
      } else if (sortField === 'Last Updated On') {
        valA = new Date(a.lastUpdatedOn).getTime();
        valB = new Date(b.lastUpdatedOn).getTime();
      } else if (sortField === 'Customer Name' || sortField === 'Customer') {
        valA = a.customerName;
        valB = b.customerName;
      } else if (sortField === 'ID') {
        valA = a.id;
        valB = b.id;
      } else if (sortField === 'Date') {
        valA = a.date;
        valB = b.date;
      } else if (sortField === 'Company') {
        valA = a.company;
        valB = b.company;
      } else if (sortField === 'Grand Total') {
        valA = a.grandTotal;
        valB = b.grandTotal;
      } else if (sortField === 'Status') {
        valA = a.status;
        valB = b.status;
      } else if (sortField === '% Amount Billed') {
        valA = a.perAmountBilled;
        valB = b.perAmountBilled;
      } else if (sortField === '% Returned') {
        valA = a.perReturned;
        valB = b.perReturned;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [notes, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <DeliveryNoteContext.Provider
      value={{
        notes,
        filteredNotes,
        viewMode,
        setViewMode,
        savedFilter,
        setSavedFilter,
        isAddModalOpen,
        setIsAddModalOpen,
        selectedNote,
        setSelectedNote,
        quickFilters,
        setQuickFilters,
        filterRules,
        setFilterRules,
        isFilterPopoverOpen,
        setIsFilterPopoverOpen,
        sortField,
        setSortField,
        sortOrder,
        setSortOrder,
        pageSize,
        setPageSize,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        toggleLike,
        refresh,
        isRefreshing,
        createNote,
        updateStatus,
        deleteNotes,
      }}
    >
      {children}
    </DeliveryNoteContext.Provider>
  );
};

export const useDeliveryNote = () => {
  const context = useContext(DeliveryNoteContext);
  if (!context) {
    throw new Error('useDeliveryNote must be used within a DeliveryNoteProvider');
  }
  return context;
};

