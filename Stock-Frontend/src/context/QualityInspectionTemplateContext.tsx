import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { QualityInspectionTemplateRecord, StockViewMode } from '../types';
import { stockService } from '../api';

interface QualityInspectionTemplateContextType {
  templates: QualityInspectionTemplateRecord[];
  filteredTemplates: QualityInspectionTemplateRecord[];
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
  addTemplate: (entry: Partial<QualityInspectionTemplateRecord>) => Promise<QualityInspectionTemplateRecord>;
  updateTemplate: (id: string, updated: Partial<QualityInspectionTemplateRecord>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
}

const QualityInspectionTemplateContext = createContext<QualityInspectionTemplateContextType | undefined>(undefined);

export const QualityInspectionTemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<QualityInspectionTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<StockViewMode>('list');
  const [filterId, setFilterId] = useState('');
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await stockService.getQualityInspectionTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load Quality Inspection Templates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      if (filterId.trim()) {
        const query = filterId.toLowerCase().trim();
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesName = item.templateName.toLowerCase().includes(query);
        if (!matchesId && !matchesName) {
          return false;
        }
      }
      return true;
    });
  }, [templates, filterId]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTemplates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTemplates.map((item) => item.id));
    }
  };

  const toggleLike = (id: string) => {
    setTemplates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isLiked: !item.isLiked } : item))
    );
  };

  const addTemplate = async (
    entry: Partial<QualityInspectionTemplateRecord>
  ): Promise<QualityInspectionTemplateRecord> => {
    const created = await stockService.createQualityInspectionTemplate(entry);
    setTemplates((prev) => [created, ...prev]);
    return created;
  };

  const updateTemplate = async (
    id: string,
    updated: Partial<QualityInspectionTemplateRecord>
  ) => {
    setTemplates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated, lastEdited: 'just now' } : item))
    );
  };

  const deleteTemplate = async (id: string) => {
    setTemplates((prev) => prev.filter((item) => item.id !== id));
  };

  const refreshTemplates = async () => {
    await loadData();
  };

  return (
    <QualityInspectionTemplateContext.Provider
      value={{
        templates,
        filteredTemplates,
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
        addTemplate,
        updateTemplate,
        deleteTemplate,
        refreshTemplates,
      }}
    >
      {children}
    </QualityInspectionTemplateContext.Provider>
  );
};

export const useQualityInspectionTemplate = () => {
  const context = useContext(QualityInspectionTemplateContext);
  if (!context) {
    throw new Error('useQualityInspectionTemplate must be used within a QualityInspectionTemplateProvider');
  }
  return context;
};

