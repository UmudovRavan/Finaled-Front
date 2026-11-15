import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { QualityInspectionRecord } from '../types';
import { stockService } from '../api';

interface QualityInspectionContextType {
  inspections: QualityInspectionRecord[];
  filteredInspections: QualityInspectionRecord[];
  loading: boolean;
  filterId: string;
  setFilterId: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  selectedIds: string[];
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  addInspection: (entry: Partial<QualityInspectionRecord>) => Promise<QualityInspectionRecord>;
  updateInspection: (id: string, updated: Partial<QualityInspectionRecord>) => Promise<void>;
  submitInspection: (id: string) => Promise<void>;
  cancelInspection: (id: string) => Promise<void>;
  deleteInspection: (id: string) => Promise<void>;
  refreshInspections: () => Promise<void>;
}

const QualityInspectionContext = createContext<QualityInspectionContextType | undefined>(undefined);

export const QualityInspectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspections, setInspections] = useState<QualityInspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterId, setFilterId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getQualityInspections();
      setInspections(data);
    } catch (err) {
      console.error('Failed to load Quality Inspections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInspections = useMemo(() => {
    return inspections.filter((qi) => {
      if (filterId.trim()) {
        const q = filterId.toLowerCase().trim();
        const matchId = qi.id.toLowerCase().includes(q) || (qi.inspectionNo || '').toLowerCase().includes(q);
        const matchItem = (qi.itemCode || '').toLowerCase().includes(q);
        const matchRef = (qi.referenceDocumentNo || '').toLowerCase().includes(q);
        if (!matchId && !matchItem && !matchRef) return false;
      }
      if (filterStatus && qi.documentStatus !== filterStatus && qi.qualityStatus !== filterStatus) return false;
      return true;
    });
  }, [inspections, filterId, filterStatus]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInspections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInspections.map((i) => i.id));
    }
  };

  const addInspection = async (entry: Partial<QualityInspectionRecord>) => {
    const created = await stockService.createQualityInspection(entry);
    setInspections((prev) => [created, ...prev]);
    return created;
  };

  const updateInspection = async (id: string, updated: Partial<QualityInspectionRecord>) => {
    const saved = await stockService.updateQualityInspection(id, updated);
    setInspections((prev) =>
      prev.map((qi) => (qi.id.toLowerCase() === id.toLowerCase() ? { ...qi, ...saved } : qi))
    );
  };

  const submitInspection = async (id: string) => {
    const saved = await stockService.submitQualityInspection(id);
    setInspections((prev) =>
      prev.map((qi) => (qi.id.toLowerCase() === id.toLowerCase() ? { ...qi, ...saved } : qi))
    );
  };

  const cancelInspection = async (id: string) => {
    const saved = await stockService.cancelQualityInspection(id);
    setInspections((prev) =>
      prev.map((qi) => (qi.id.toLowerCase() === id.toLowerCase() ? { ...qi, ...saved } : qi))
    );
  };

  const deleteInspection = async (id: string) => {
    await stockService.deleteQualityInspection(id);
    setInspections((prev) => prev.filter((qi) => qi.id.toLowerCase() !== id.toLowerCase()));
  };

  return (
    <QualityInspectionContext.Provider
      value={{
        inspections,
        filteredInspections,
        loading,
        filterId,
        setFilterId,
        filterStatus,
        setFilterStatus,
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        addInspection,
        updateInspection,
        submitInspection,
        cancelInspection,
        deleteInspection,
        refreshInspections: loadData,
      }}
    >
      {children}
    </QualityInspectionContext.Provider>
  );
};

export const useQualityInspection = () => {
  const ctx = useContext(QualityInspectionContext);
  if (!ctx) throw new Error('useQualityInspection must be used within QualityInspectionProvider');
  return ctx;
};
