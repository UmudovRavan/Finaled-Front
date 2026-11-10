import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type {
  MaterialRequestRecord,
  MaterialRequestStatus,
  StockViewMode,
  FilterRule,
} from '../types';
import { stockService, INITIAL_MATERIAL_REQUESTS } from '../api';

interface MaterialRequestQuickFiltersState {
  id: string;
  title: string;
  purpose: string;
  company: string;
  status: string;
}

interface MaterialRequestContextType {
  requests: MaterialRequestRecord[];
  filteredRequests: MaterialRequestRecord[];
  viewMode: StockViewMode;
  setViewMode: (mode: StockViewMode) => void;
  savedFilter: string;
  setSavedFilter: (filter: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectedRequest: MaterialRequestRecord | null;
  setSelectedRequest: (req: MaterialRequestRecord | null) => void;
  quickFilters: MaterialRequestQuickFiltersState;
  setQuickFilters: React.Dispatch<React.SetStateAction<MaterialRequestQuickFiltersState>>;
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
  createRequest: (data: Partial<MaterialRequestRecord>) => Promise<MaterialRequestRecord>;
  updateStatus: (id: string, status: MaterialRequestStatus) => void;
  deleteRequests: (ids: string[]) => void;
}

const MaterialRequestContext = createContext<MaterialRequestContextType | undefined>(undefined);

export const MaterialRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<MaterialRequestRecord[]>(() => {
    const saved = localStorage.getItem('altensor_material_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MATERIAL_REQUESTS;
      }
    }
    return INITIAL_MATERIAL_REQUESTS;
  });

  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [savedFilter, setSavedFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequestRecord | null>(null);

  const [quickFilters, setQuickFilters] = useState<MaterialRequestQuickFiltersState>({
    id: '',
    title: '',
    purpose: '',
    company: '',
    status: '',
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [sortField, setSortField] = useState<string>('Last Updated On');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem('altensor_material_requests', JSON.stringify(requests));
  }, [requests]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await stockService.getMaterialRequests();
      if (data && data.length > 0) {
        setRequests(data);
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
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map((e) => e.id));
    }
  };

  const toggleLike = (id: string) => {
    setRequests((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isLiked: !e.isLiked } : e))
    );
  };

  const createRequest = async (data: Partial<MaterialRequestRecord>) => {
    const created = await stockService.createMaterialRequest(data);
    setRequests((prev) => [created, ...prev]);
    return created;
  };

  const updateStatus = (id: string, status: MaterialRequestStatus) => {
    setRequests((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              lastUpdatedOn: new Date().toISOString(),
            }
          : e
      )
    );
  };

  const deleteRequests = (ids: string[]) => {
    setRequests((prev) => prev.filter((e) => !ids.includes(e.id)));
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (quickFilters.id.trim()) {
      const q = quickFilters.id.toLowerCase().trim();
      result = result.filter((e) => e.id.toLowerCase().includes(q));
    }
    if (quickFilters.title.trim()) {
      const q = quickFilters.title.toLowerCase().trim();
      result = result.filter((e) => e.title.toLowerCase().includes(q));
    }
    if (quickFilters.purpose.trim()) {
      const q = quickFilters.purpose.toLowerCase().trim();
      result = result.filter((e) => e.purpose.toLowerCase() === q);
    }
    if (quickFilters.company.trim()) {
      const q = quickFilters.company.toLowerCase().trim();
      result = result.filter((e) => e.company.toLowerCase().includes(q));
    }
    if (quickFilters.status.trim()) {
      const q = quickFilters.status.toLowerCase().trim();
      result = result.filter((e) => e.status.toLowerCase() === q);
    }

    if (savedFilter !== 'All') {
      result = result.filter((e) => e.status === savedFilter || e.purpose === savedFilter);
    }

    for (const rule of filterRules) {
      if (!rule.value.trim()) continue;
      const val = rule.value.toLowerCase().trim();

      result = result.filter((e) => {
        let fieldVal = '';
        if (rule.field === 'ID') fieldVal = e.id;
        else if (rule.field === 'Title') fieldVal = e.title;
        else if (rule.field === 'Purpose') fieldVal = e.purpose;
        else if (rule.field === 'Status') fieldVal = e.status;
        else if (rule.field === 'Company') fieldVal = e.company;
        else if (rule.field === 'Transaction Date') fieldVal = e.transactionDate;
        else if (rule.field === 'Required By') fieldVal = e.requiredBy;

        fieldVal = fieldVal.toLowerCase();

        if (rule.operator === 'Equals') return fieldVal === val;
        if (rule.operator === 'Like') return fieldVal.includes(val);
        if (rule.operator === '!=') return fieldVal !== val;
        if (rule.operator === 'In') return val.split(',').map((s) => s.trim()).includes(fieldVal);
        return true;
      });
    }

    result.sort((a, b) => {
      let valA: any = a.createdOn;
      let valB: any = b.createdOn;

      if (sortField === 'Created On') {
        valA = new Date(a.createdOn).getTime();
        valB = new Date(b.createdOn).getTime();
      } else if (sortField === 'Last Updated On') {
        valA = new Date(a.lastUpdatedOn).getTime();
        valB = new Date(b.lastUpdatedOn).getTime();
      } else if (sortField === 'Title') {
        valA = a.title;
        valB = b.title;
      } else if (sortField === 'ID') {
        valA = a.id;
        valB = b.id;
      } else if (sortField === 'Purpose') {
        valA = a.purpose;
        valB = b.purpose;
      } else if (sortField === 'Status') {
        valA = a.status;
        valB = b.status;
      } else if (sortField === 'Transaction Date') {
        valA = a.transactionDate;
        valB = b.transactionDate;
      } else if (sortField === 'Required By') {
        valA = a.requiredBy;
        valB = b.requiredBy;
      } else if (sortField === 'Company') {
        valA = a.company;
        valB = b.company;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [requests, quickFilters, savedFilter, filterRules, sortField, sortOrder]);

  return (
    <MaterialRequestContext.Provider
      value={{
        requests,
        filteredRequests,
        viewMode,
        setViewMode,
        savedFilter,
        setSavedFilter,
        isAddModalOpen,
        setIsAddModalOpen,
        selectedRequest,
        setSelectedRequest,
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
        createRequest,
        updateStatus,
        deleteRequests,
      }}
    >
      {children}
    </MaterialRequestContext.Provider>
  );
};

export const useMaterialRequest = () => {
  const context = useContext(MaterialRequestContext);
  if (!context) {
    throw new Error('useMaterialRequest must be used within a MaterialRequestProvider');
  }
  return context;
};

