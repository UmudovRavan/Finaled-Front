import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useQualityInspection, useQualityInspectionTemplate, useItem } from '../context';
import type { QualityInspectionReadingItem, QualityInspectionType } from '../types';

export const NewQualityInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTemplate = searchParams.get('template') || '';

  const { addInspection } = useQualityInspection();
  const { templates } = useQualityInspectionTemplate();
  const { items } = useItem();

  const [itemCode, setItemCode] = useState('');
  const [inspectionType, setInspectionType] = useState<QualityInspectionType>('Incoming');
  const [referenceType, setReferenceType] = useState('');
  const [referenceDocumentNo, setReferenceDocumentNo] = useState('');
  const [qualityInspectionTemplateId, setQualityInspectionTemplateId] = useState(initialTemplate);
  const [sampleSize, setSampleSize] = useState(1);
  const [inspectedBy, setInspectedBy] = useState('Administrator');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [readings, setReadings] = useState<QualityInspectionReadingItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!qualityInspectionTemplateId) return;
    const tpl = templates.find(
      (t) =>
        t.templateName.toLowerCase() === qualityInspectionTemplateId.toLowerCase() ||
        t.id.toLowerCase() === qualityInspectionTemplateId.toLowerCase()
    );
    if (tpl && tpl.parameters && tpl.parameters.length > 0 && readings.length === 0) {
      setReadings(
        tpl.parameters.map((p, idx) => ({
          id: `rd-${Date.now()}-${idx}`,
          specification: p.parameter,
          acceptanceCriteriaValue: p.acceptanceCriteria || '',
          numeric: p.numeric ?? true,
          minValue: p.minValue ?? 0,
          maxValue: p.maxValue ?? 0,
          reading1: null,
          status: 'Accepted',
        }))
      );
    }
  }, [qualityInspectionTemplateId, templates]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim()) {
      alert('Item Code is required');
      return;
    }
    const matchedItem = items.find(
      (i) => i.itemCode.toLowerCase() === itemCode.trim().toLowerCase()
    );
    try {
      setIsSaving(true);
      const created = await addInspection({
        itemId: matchedItem?.id || '',
        itemCode: itemCode.trim(),
        inspectionType,
        referenceType,
        referenceDocumentNo,
        qualityInspectionTemplateId: qualityInspectionTemplateId || undefined,
        sampleSize,
        inspectedBy,
        reportDate,
        remarks,
        readings,
      });
      navigate(`/quality-inspection/${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error('Failed to create Quality Inspection', err);
      alert('Failed to create Quality Inspection');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 font-sans text-xs">
      <form onSubmit={handleSave} className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-3">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white">New Quality Inspection</h1>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1">Item Code *</label>
              <input
                type="text"
                list="qi-items-list"
                required
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
              />
              <datalist id="qi-items-list">
                {items.map((it) => (
                  <option key={it.id} value={it.itemCode}>{it.itemName}</option>
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1">Inspection Type *</label>
              <select
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value as QualityInspectionType)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
              >
                <option value="Incoming">Incoming</option>
                <option value="Outgoing">Outgoing</option>
                <option value="InProcess">In Process</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1">Quality Inspection Template</label>
              <select
                value={qualityInspectionTemplateId}
                onChange={(e) => setQualityInspectionTemplateId(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
              >
                <option value="">-- Select Template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.templateName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1">Reference Type</label>
              <select
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
              >
                <option value="">-- None --</option>
                <option value="Purchase Receipt">Purchase Receipt</option>
                <option value="Delivery Note">Delivery Note</option>
                <option value="Stock Entry">Stock Entry</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1">Reference Document No</label>
              <input
                type="text"
                value={referenceDocumentNo}
                onChange={(e) => setReferenceDocumentNo(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">Sample Size</label>
                <input
                  type="number"
                  min={1}
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value || 1))}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">Report Date</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1">Inspected By</label>
              <input
                type="text"
                value={inspectedBy}
                onChange={(e) => setInspectedBy(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Readings</h3>
            <button
              type="button"
              onClick={() =>
                setReadings((prev) => [
                  ...prev,
                  {
                    id: `rd-${Date.now()}`,
                    specification: '',
                    numeric: true,
                    minValue: 0,
                    maxValue: 0,
                    reading1: null,
                    status: 'Accepted',
                  },
                ])
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F5F7] dark:bg-[#202024] text-slate-700 dark:text-zinc-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFBFD] dark:bg-[#1A1A1E] border-b border-slate-200 dark:border-[#27272A] text-slate-500">
                  <th className="py-2 px-3">Parameter</th>
                  <th className="py-2 px-3">Min</th>
                  <th className="py-2 px-3">Max</th>
                  <th className="py-2 px-3">Reading 1</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="w-10 py-2 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#202024]">
                {readings.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={r.specification}
                        onChange={(e) =>
                          setReadings((prev) =>
                            prev.map((row, i) => (i === idx ? { ...row, specification: e.target.value } : row))
                          )
                        }
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="number"
                        step="any"
                        value={r.minValue ?? 0}
                        onChange={(e) =>
                          setReadings((prev) =>
                            prev.map((row, i) => (i === idx ? { ...row, minValue: Number(e.target.value) } : row))
                          )
                        }
                        className="w-20 bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="number"
                        step="any"
                        value={r.maxValue ?? 0}
                        onChange={(e) =>
                          setReadings((prev) =>
                            prev.map((row, i) => (i === idx ? { ...row, maxValue: Number(e.target.value) } : row))
                          )
                        }
                        className="w-20 bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="number"
                        step="any"
                        value={r.reading1 ?? ''}
                        onChange={(e) =>
                          setReadings((prev) =>
                            prev.map((row, i) =>
                              i === idx ? { ...row, reading1: e.target.value === '' ? null : Number(e.target.value) } : row
                            )
                          )
                        }
                        className="w-24 bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          setReadings((prev) =>
                            prev.map((row, i) => (i === idx ? { ...row, status: e.target.value as any } : row))
                          )
                        }
                        className="bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none"
                      >
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => setReadings((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-zinc-400 mb-1">Remarks</label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none"
          />
        </div>
      </form>
    </div>
  );
};
