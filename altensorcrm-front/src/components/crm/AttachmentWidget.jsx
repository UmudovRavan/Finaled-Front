import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentIcon,
  PhotoIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  TableCellsIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { taskManagementApi, getCurrentUser } from '../../services/api';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileExtension = (fileName = '') => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const renderFileIcon = (fileName = '') => {
  const ext = getFileExtension(fileName);
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
    return <PhotoIcon className="w-5 h-5 text-emerald-400" />;
  }
  if (['pdf'].includes(ext)) {
    return <DocumentIcon className="w-5 h-5 text-rose-400" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <ArchiveBoxIcon className="w-5 h-5 text-amber-400" />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <TableCellsIcon className="w-5 h-5 text-teal-400" />;
  }
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return <DocumentTextIcon className="w-5 h-5 text-sky-400" />;
  }
  return <DocumentIcon className="w-5 h-5 text-indigo-400" />;
};

const AttachmentWidget = ({
  leadId = null,
  dealId = null,
  title = '',
  initialAttachments = []
}) => {
  const { language } = useLanguage();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadNote, setUploadNote] = useState('');
  const [previewingId, setPreviewingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAttachments = async () => {
    setLoading(true);
    try {
      let collected = [];

      // 1. Initial attachments passed from CRM entity
      if (Array.isArray(initialAttachments) && initialAttachments.length > 0) {
        collected.push(
          ...initialAttachments.map((a, idx) => ({
            id: a.id || a.Id || `crm_att_${idx}`,
            fileName: a.fileName || a.FileName || 'Attachment',
            size: a.fileSize || a.FileSize || a.size || 0,
            uploadedAt: a.uploadedAt || a.UploadedAt || new Date().toISOString(),
            source: 'CRM',
            rawAttachment: a
          }))
        );
      }

      // 2. Fetch all tasks from TMS related to this lead/deal
      try {
        const tasks = await taskManagementApi.getAllTasks();
        const taskList = Array.isArray(tasks) ? tasks : (tasks?.data || tasks?.items || []);

        let matchedTasks = [];
        if (leadId) {
          matchedTasks = taskList.filter((t) =>
            String(t.leadId || t.LeadId || '') === String(leadId) ||
            (t.description && t.description.includes(`[LEAD_ID:${leadId}]`)) ||
            (t.title && (t.title.includes(`Lead #${leadId}`) || t.title.includes(`Lead Activity Task #${leadId}`)))
          );
        } else if (dealId) {
          matchedTasks = taskList.filter((t) =>
            String(t.dealId || t.DealId || '') === String(dealId) ||
            (t.description && t.description.includes(`[DEAL_ID:${dealId}]`)) ||
            (t.title && (t.title.includes(`Deal #${dealId}`) || t.title.includes(`Deal Activity Task #${dealId}`)))
          );
        }

        matchedTasks.forEach((task) => {
          const rawAtts = task.attachments || task.Attachments || task.files || task.Files || task.taskAttachments || task.TaskAttachments || [];
          if (Array.isArray(rawAtts)) {
            rawAtts.forEach((att) => {
              const attId = att.id || att.Id || att.attachmentId || att.AttachmentId;
              if (attId && !collected.some((c) => String(c.id) === String(attId))) {
                collected.push({
                  id: String(attId),
                  fileName: att.fileName || att.FileName || 'Attachment',
                  size: att.size || att.Size || 0,
                  contentType: att.contentType || att.ContentType || '',
                  uploadedAt: att.createdAt || att.CreatedAt || task.createdAt || task.Deadline || new Date().toISOString(),
                  source: 'TMS',
                  taskId: task.id || task.Id,
                  taskTitle: task.title || task.Title,
                  rawAttachment: att
                });
              }
            });
          }
        });
      } catch (err) {
        console.warn('Notice loading TMS task attachments:', err);
      }

      // Sort by newest first
      collected.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
      setAttachments(collected);
    } catch (err) {
      console.warn('Error loading attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttachments();
  }, [leadId, dealId]);


  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      showToast(language === 'az' ? 'Zəhmət olmasa ən azı bir fayl seçin.' : 'Please select at least one file.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = getCurrentUser();
      const currentUserId = currentUser?.userId || currentUser?.id || '';

      const entityTag = leadId ? `[LEAD_ID:${leadId}]` : dealId ? `[DEAL_ID:${dealId}]` : '';
      const entityLabel = leadId ? `Lead #${leadId}` : dealId ? `Deal #${dealId}` : 'Entity';
      const fileSummary = selectedFiles.length === 1
        ? selectedFiles[0].name
        : `${selectedFiles[0].name} (+${selectedFiles.length - 1} fayl)`;

      const taskTitle = `${entityLabel} Sənəd Qoşması: ${fileSummary}`;
      const taskDesc = `${entityTag}\n${uploadNote ? `${uploadNote}\n` : ''}Qoşma fayllar: ${selectedFiles.map((f) => f.name).join(', ')}`;

      const payload = {
        title: taskTitle,
        description: taskDesc,
        difficulty: 1,
        status: 3, // Done / Archived activity
        deadline: new Date().toISOString(),
        createdByUserId: currentUserId
      };

      await taskManagementApi.createTask(payload, selectedFiles);

      showToast(
        language === 'az'
          ? `${selectedFiles.length} fayl uğurla əlavə edildi!`
          : `${selectedFiles.length} file(s) attached successfully!`,
        'success'
      );

      setIsUploadModalOpen(false);
      setSelectedFiles([]);
      setUploadNote('');
      await loadAttachments();
    } catch (err) {
      showToast(err.message || (language === 'az' ? 'Yüklənmə xətası baş verdi.' : 'Upload failed.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      setDownloadingId(attachment.id);
      await taskManagementApi.downloadAttachment(attachment.id, attachment.fileName);
    } catch (err) {
      showToast(err.message || (language === 'az' ? 'Fayl endirilə bilmədi' : 'Download failed'), 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (attachment) => {
    try {
      setPreviewingId(attachment.id);
      const res = await taskManagementApi.getAttachmentPreviewUrl(attachment.id);
      const url = res?.url || res?.Url || res;
      if (url && typeof url === 'string') {
        window.open(url, '_blank');
      } else {
        showToast(language === 'az' ? 'Önbaxış linki tapılmadı' : 'Preview URL not found', 'error');
      }
    } catch (err) {
      showToast(err.message || (language === 'az' ? 'Önbaxış açıla bilmədi' : 'Preview failed'), 'error');
    } finally {
      setPreviewingId(null);
    }
  };

  const filteredAttachments = useMemo(() => {
    if (!searchQuery.trim()) return attachments;
    const q = searchQuery.toLowerCase();
    return attachments.filter((a) => a.fileName.toLowerCase().includes(q));
  }, [attachments, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 bg-[#E4E4E7] text-[#18181B] px-4 py-2.5 rounded-2xl shadow-2xl min-w-[260px] max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircleIcon className="w-5 h-5 text-black shrink-0" />
          <span className="text-xs font-semibold flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-[#71717A] hover:text-black">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2C2C2E]/40 pb-3.5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {language === 'az' ? 'Əlavələr' : language === 'en' ? 'Attachments' : 'Вложения'}
          </h1>
          {attachments.length > 0 && (
            <span className="bg-[#27272A] text-sky-400 border border-[#3F3F46]/50 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {attachments.length} {language === 'az' ? 'fayl' : 'files'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          {attachments.length > 3 && (
            <div className="relative">
              <input
                type="text"
                placeholder={language === 'az' ? 'Axtar...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 w-36 sm:w-48"
              />
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Refresh */}
          <button
            type="button"
            onClick={loadAttachments}
            className="p-2 rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            title={language === 'az' ? 'Yenilə' : 'Refresh'}
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'az' ? 'Fayl yüklə' : language === 'en' ? 'Upload File' : 'Загрузить файл'}</span>
          </button>
        </div>
      </div>

      {/* Attachments Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
          <ArrowPathIcon className="w-5 h-5 animate-spin text-sky-400" />
          <span>{language === 'az' ? 'Fayllar yüklənir...' : 'Loading files...'}</span>
        </div>
      ) : filteredAttachments.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A] mb-3">
            <PaperClipIcon className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white">
            {language === 'az' ? 'Əlavə tapılmadı' : language === 'en' ? 'No Attachments Found' : 'Вложений не найдено'}
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-4">
            {language === 'az'
              ? 'Bu bölməyə sənədlər, müqavilələr və şəkillər yükləyərək izləyə bilərsiniz.'
              : 'Upload documents, contracts, or images to keep track.'}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46]/60 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{language === 'az' ? 'İlk faylı yüklə' : 'Upload first file'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredAttachments.map((att) => (
            <div
              key={att.id}
              className="bg-[#1C1C1E]/80 hover:bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#3F3F46] rounded-2xl p-4 transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#27272A] border border-[#3F3F46]/50 shrink-0">
                  {renderFileIcon(att.fileName)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors"
                    title={att.fileName}
                  >
                    {att.fileName}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#71717A] mt-1">
                    {att.size > 0 && <span>{formatFileSize(att.size)}</span>}
                    {att.size > 0 && <span>•</span>}
                    <span>
                      {att.uploadedAt
                        ? new Date(att.uploadedAt).toLocaleDateString('az-AZ', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2E]/60 text-xs">
                <span className="text-[10px] text-[#52525B] truncate max-w-[120px]" title={att.taskTitle || 'MinIO Cloud'}>
                  {att.taskTitle || 'MinIO Cloud'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePreview(att)}
                    disabled={previewingId === att.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] hover:text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
                    title={language === 'az' ? 'Önbaxış' : 'Preview'}
                  >
                    {previewingId === att.id ? (
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    ) : (
                      <EyeIcon className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px]">{language === 'az' ? 'Bax' : 'Preview'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(att)}
                    disabled={downloadingId === att.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4D4D8] hover:text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
                    title={language === 'az' ? 'Yüklə' : 'Download'}
                  >
                    {downloadingId === att.id ? (
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    ) : (
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px]">{language === 'az' ? 'Yüklə' : 'Download'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl shadow-2xl w-full max-w-lg p-6 text-[#E4E4E7] space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2C2C2E]/60 pb-3">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {language === 'az' ? 'Fayl Yüklə' : language === 'en' ? 'Upload Files' : 'Загрузить файлы'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFiles([]);
                  setUploadNote('');
                }}
                className="p-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Drag & Drop Box */}
              <label
                htmlFor="widgetFileUploadInput"
                className="border-2 border-dashed border-[#3F3F46] hover:border-sky-500 bg-[#141416]/50 hover:bg-[#141416]/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group space-y-2"
              >
                <PaperClipIcon className="w-8 h-8 text-[#71717A] group-hover:text-sky-400 transition-colors" />
                <p className="text-xs text-[#E4E4E7] font-semibold">
                  {language === 'az' ? 'Faylları seçmək üçün klikləyin və ya bura atın' : 'Click to select or drag & drop files here'}
                </p>
                <p className="text-[11px] text-[#71717A]">
                  PDF, DOCX, XLSX, PNG, JPG, ZIP və digər formatlar
                </p>
                <input
                  id="widgetFileUploadInput"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const incoming = Array.from(e.target.files);
                      setSelectedFiles((prev) => [...prev, ...incoming]);
                      e.target.value = '';
                    }
                  }}
                />
              </label>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A1A1AA] font-semibold">
                      {language === 'az' ? 'Seçilmiş Fayllar' : 'Selected Files'} ({selectedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-[11px] text-red-400 hover:text-red-300 font-medium cursor-pointer"
                    >
                      {language === 'az' ? 'Hamısını təmizlə' : 'Clear all'}
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-[#27272A]/70 border border-[#3F3F46]/50 rounded-xl px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {renderFileIcon(file.name)}
                          <span className="text-white truncate font-medium">{file.name}</span>
                          <span className="text-[10px] text-[#71717A] shrink-0">({formatFileSize(file.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-[#A1A1AA] hover:text-red-400 transition-colors cursor-pointer"
                          title={language === 'az' ? 'Sil' : 'Remove'}
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Notes */}
              <div className="space-y-1.5">
                <label className="text-[#A1A1AA] font-semibold">
                  {language === 'az' ? 'Fayl haqqında qeyd (ixtiyari)' : 'Note / Description (optional)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'az' ? 'Məs: Müqavilə layihəsi, Təqdimat sənədi...' : 'e.g. Contract draft, Proposal document...'}
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  className="w-full bg-[#141416] border border-[#2C2C2E] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2C2C2E]/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFiles([]);
                    setUploadNote('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] font-semibold text-xs transition-colors cursor-pointer"
                >
                  {language === 'az' ? 'Ləğv et' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedFiles.length === 0}
                  className="px-6 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? (language === 'az' ? 'Yüklənir...' : 'Uploading...')
                    : (language === 'az' ? 'Yüklə' : 'Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentWidget;
