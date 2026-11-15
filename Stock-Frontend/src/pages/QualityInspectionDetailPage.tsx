import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, Ban } from 'lucide-react';
import { useQualityInspection, useQualityInspectionTemplate, useItem } from '../context';
import { DocumentCommentsActivity, DocumentSidebarMeta } from '../components/common';
import type { QualityInspectionReadingItem, QualityInspectionType } from '../types';

export const QualityInspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    inspections,
    loading,
    updateInspection,
    submitInspection,
    cancelInspection,
    deleteInspection,
  } = useQualityInspection();
  const { templates } = useQualityInspectionTemplate();
  const { items } = useItem();

  const decodedId = decodeURIComponent(id || '');
  const current = inspections.find((q) => q.id.toLowerCase() === decodedId.toLowerCase());

  const [itemCode, setItemCode] = useState('');
  const [inspectionType, setInspectionType] = useState<QualityInspectionType>('Incoming');
  const [referenceType, setReferenceType] = useState('');
  const [referenceDocumentNo, setReferenceDocumentNo] = useState('');
  const [qualityInspectionTemplateId, setQualityInspectionTemplateId] = useState('');
  const [sampleSize, setSampleSize] = useState(1);
  const [inspectedBy, setInspectedBy] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [readings, setReadings] = useState<QualityInspectionReadingItem[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (current) {
      setItemCode(current.itemCode || '');
      setInspectionType(current.inspectionType || 'Incoming');
      setReferenceType(current.referenceType || '');
      setReferenceDocumentNo(current.referenceDocumentNo || '');
      setQualityInspectionTemplateId(current.qualityInspectionTemplateId || '');
      setSampleSize(current.sampleSize || 1);
      setInspectedBy(current.inspectedBy || '');
      setReportDate(current.reportDate || '');
      setRemarks(current.remarks || '');
      setReadings(current.readings || []);
    }
  }, [current]);

  if (loading && !current) {
    return <div className="p-8 text-center text-slate-500 text-sm">Loading Quality Inspection...</div>;
  }

  if (!current) {
    return <div className="p-8 text-center text-slate-500 text-sm">Quality Inspection not found.</div>;
  }

  const isDraft = current.documentStatus === 'Draft';

  const handleSave = async () => {
    const matchedItem = items.find(
      (i) => i.itemCode.toLowerCase() === itemCode.trim().toLowerCase() || i.id === itemCode.trim()
    );
    try {
      setIsBusy(true);
      await updateInspection(current.id, {
        inspectionNo: current.inspectionNo,
        company: current.company,
        itemId: matchedItem?.id || current.itemId,
        itemCode: itemCode.trim(),
        inspectionType,
        referenceType,
        referenceId: current.referenceId,
        referenceDocumentNo,
        batchId: current.batchId,
        itemSerialNo: current.itemSerialNo,
        qualityInspectionTemplateId: qualityInspectionTemplateId || undefined,
        sampleSize,
        inspectedBy,
        verifiedBy: current.verifiedBy,
        reportDate,
        remarks,
        readings,
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <div className="flex-1 w-full space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-900 dark:text-white">
                {current.inspectionNo || current.id}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-[#202024] text-slate-700 dark:text-zinc-300">
                {current.documentStatus} ({current.qualityStatus})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isDraft && (
                <>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleSave}
                    className="px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={async () => {
                      setIsBusy(true);
                      try {
                        await submitInspection(current.id);
                      } finally {
                        setIsBusy(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={async () => {
                      if (!window.confirm('Delete this Quality Inspection?')) return;
                      await deleteInspection(current.id);
                      navigate('/quality-inspection');
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
              {!isDraft && current.documentStatus !== 'Cancelled' && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={async () => {
                    setIsBusy(true);
                    try {
                      await cancelInspection(current.id);
                    } finally {
                      setIsBusy(false);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">Item Code</label>
                  <input
                    type="text"
                    disabled={!isDraft}
                    list="qi-detail-items-list"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-3 py-2 rounded-lg outline-none disabled:opacity-60"
                  />
                  <datalist id="qi-detail-items-list">
                    {items.map((it) => (
                      <option key={it.id} value={it.itemCode}>{it.itemName}</option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">Inspection Type</label>
                  <select
                    disabled={!isDraft}
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value as QualityInspectionType)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-3 py-2 rounded-lg outline-none disabled:opacity-60"
                  >
                    <option value="Incoming">Incoming</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="InProcess">In Process</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">Template</label>
                  <select
                    disabled={!isDraft}
                    value={qualityInspectionTemplateId}
                    onChange={(e) => setQualityInspectionTemplateId(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-3 py-2 rounded-lg outline-none disabled:opacity-60"
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
                  <input
                    type="text"
                    disabled={!isDraft}
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-3 py-2 rounded-lg outline-none disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">Reference Document No</label>
                  <input
                    type="text"
                    disabled={!isDraft}
                    value={referenceDocumentNo}
                    onChange={(e) => setReferenceDocumentNo(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-3 py-2 rounded-lg outline-none disabled:opacity-60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">Sample Size</label>
                    <input
                      type="number"
                      disabled={!isDraft}
                      value={sampleSize}
                      onChange={(e) => setSampleSize(Number(e.target.value || 1))}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-3 py-2 rounded-lg outline-none disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">Report Date</label>
                    <input
                      type="date"
                      disabled={!isDraft}
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-3 py-2 rounded-lg outline-none disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-zinc-200">Readings</h3>
                {isDraft && (
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F4F5F7] dark:bg-[#202024]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                )}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#202024]">
                    {readings.map((r, idx) => (
                      <tr key={r.id}>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            disabled={!isDraft}
                            value={r.specification}
                            onChange={(e) =>
                              setReadings((prev) =>
                                prev.map((row, i) => (i === idx ? { ...row, specification: e.target.value } : row))
                              )
                            }
                            className="w-full bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none disabled:opacity-60"
                          />
                        </td>
                        <td className="py-1.5 px-2">{r.minValue ?? 0}</td>
                        <td className="py-1.5 px-2">{r.maxValue ?? 0}</td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            step="any"
                            disabled={!isDraft}
                            value={r.reading1 ?? ''}
                            onChange={(e) =>
                              setReadings((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, reading1: e.target.value === '' ? null : Number(e.target.value) } : row
                                )
                              )
                            }
                            className="w-24 bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none disabled:opacity-60"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            disabled={!isDraft}
                            value={r.status}
                            onChange={(e) =>
                              setReadings((prev) =>
                                prev.map((row, i) => (i === idx ? { ...row, status: e.target.value as any } : row))
                              )
                            }
                            className="bg-[#F4F5F7] dark:bg-[#202024] px-2 py-1 rounded outline-none disabled:opacity-60"
                          >
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DocumentCommentsActivity docType="QualityInspection" docId={current.id} />
        </div>

        <aside className="w-full lg:w-[270px] shrink-0">
          <DocumentSidebarMeta
            docType="QualityInspection"
            docId={current.id}
            docName={current.inspectionNo || current.id}
          />
        </aside>
      </div>
    </div>
  );
};
