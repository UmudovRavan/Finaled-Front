import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Folder, Link2, Camera, X, FileText, Crop, Plus } from 'lucide-react';
import { stockService } from '../../api/stockService';

export interface StagedAttachmentFile {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  base64Content?: string;
  externalUrl?: string;
  sourceType: 'Device' | 'Library' | 'Link' | 'Camera';
  libraryAttachmentId?: string;
  storagePath?: string;
  previewUrl?: string;
  optimize: boolean;
  isPrivate: boolean;
}

interface UploadAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: StagedAttachmentFile[]) => Promise<void>;
}

const LIBRARY_STORAGE_KEY = 'altensor_attachment_library';

export function getAttachmentLibrary(): Array<{
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  base64Content?: string;
  externalUrl?: string;
}> {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToAttachmentLibrary(item: {
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  base64Content?: string;
  externalUrl?: string;
}): void {
  try {
    const existing = getAttachmentLibrary().filter((x) => x.fileName !== item.fileName);
    const updated = [item, ...existing].slice(0, 15);
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota errors
  }
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0B';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}M`;
}

function readFileAsBase64(file: File): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      resolve({ base64, dataUrl });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const UploadAttachmentModal: React.FC<UploadAttachmentModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const deviceInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [stagedFiles, setStagedFiles] = useState<StagedAttachmentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSubMode, setActiveSubMode] = useState<'none' | 'link' | 'library'>('none');
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [remoteLibrary, setRemoteLibrary] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || activeSubMode !== 'library') return;
    let active = true;
    setLibraryLoading(true);
    stockService
      .getAttachmentLibrary(undefined, 50)
      .then((list) => {
        if (active) setRemoteLibrary(list);
      })
      .catch(() => {
        if (active) setRemoteLibrary([]);
      })
      .finally(() => {
        if (active) setLibraryLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, activeSubMode]);

  if (!isOpen) return null;

  const localLibraryItems = getAttachmentLibrary();
  const libraryItems = remoteLibrary.length > 0 ? remoteLibrary : localLibraryItems;

  const stageNativeFiles = async (
    fileList: FileList | File[],
    sourceType: 'Device' | 'Camera' = 'Device'
  ) => {
    const arr = Array.from(fileList);
    const next: StagedAttachmentFile[] = [];
    for (const file of arr) {
      const { base64, dataUrl } = await readFileAsBase64(file);
      next.push({
        id: `stg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
        base64Content: base64,
        sourceType,
        previewUrl: file.type.startsWith('image/') ? dataUrl : undefined,
        optimize: false,
        isPrivate: false,
      });
    }
    setStagedFiles((prev) => [...prev, ...next]);
    setActiveSubMode('none');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await stageNativeFiles(e.dataTransfer.files);
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    let fileName = trimmed;
    try {
      const u = new URL(trimmed);
      fileName = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
    } catch {
      fileName = trimmed;
    }
    setStagedFiles((prev) => [
      ...prev,
      {
        id: `lnk-${Date.now()}`,
        fileName,
        contentType: 'text/uri-list',
        fileSizeBytes: 0,
        externalUrl: trimmed,
        sourceType: 'Link',
        optimize: false,
        isPrivate: false,
      },
    ]);
    setLinkUrl('');
    setActiveSubMode('none');
  };

  const handleSelectFromLibrary = (item: any) => {
    setStagedFiles((prev) => [
      ...prev,
      {
        id: `lib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fileName: item.fileName,
        contentType: item.contentType || 'application/octet-stream',
        fileSizeBytes: item.fileSizeBytes || 0,
        base64Content: item.base64Content,
        externalUrl: item.externalUrl,
        sourceType: 'Library',
        libraryAttachmentId: item.id,
        storagePath: item.storagePath,
        previewUrl:
          item.contentType?.startsWith('image/') && item.base64Content
            ? `data:${item.contentType};base64,${item.base64Content}`
            : undefined,
        optimize: false,
        isPrivate: Boolean(item.isPrivate),
      },
    ]);
    setActiveSubMode('none');
  };

  const handleSetAllPrivate = () => {
    setStagedFiles((prev) => prev.map((f) => ({ ...f, isPrivate: true })));
  };

  const handleConfirmUpload = async () => {
    if (stagedFiles.length === 0) return;
    try {
      setIsUploading(true);
      await onUpload(stagedFiles);
      setStagedFiles([]);
      setActiveSubMode('none');
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setStagedFiles([]);
    setActiveSubMode('none');
    onClose();
  };

  const hasPublicFile = stagedFiles.some((f) => !f.isPrivate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[#27272A]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Upload</h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={deviceInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) stageNativeFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) stageNativeFiles(e.target.files, 'Camera');
            e.target.value = '';
          }}
        />

        {/* Body */}
        <div className="p-5 space-y-4">
          {stagedFiles.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl py-12 px-6 text-center transition-colors ${
                isDragging
                  ? 'border-slate-500 bg-slate-50 dark:bg-[#202024]'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50/40 dark:bg-[#141417]'
              }`}
            >
              <p className="text-xs text-slate-600 dark:text-zinc-300 mb-5">
                Drag and drop files here or upload from
              </p>

              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => deviceInputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className="w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#202024] flex items-center justify-center text-slate-600 dark:text-zinc-300 group-hover:border-slate-400 dark:group-hover:border-zinc-500 transition-colors">
                    <Monitor className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">My Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubMode((m) => (m === 'library' ? 'none' : 'library'))}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className="w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#202024] flex items-center justify-center text-slate-600 dark:text-zinc-300 group-hover:border-slate-400 dark:group-hover:border-zinc-500 transition-colors">
                    <Folder className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubMode((m) => (m === 'link' ? 'none' : 'link'))}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className="w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#202024] flex items-center justify-center text-slate-600 dark:text-zinc-300 group-hover:border-slate-400 dark:group-hover:border-zinc-500 transition-colors">
                    <Link2 className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className="w-9 h-9 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#202024] flex items-center justify-center text-slate-600 dark:text-zinc-300 group-hover:border-slate-400 dark:group-hover:border-zinc-500 transition-colors">
                    <Camera className="w-4 h-4 stroke-[1.75]" />
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">Camera</span>
                </button>
              </div>

              {activeSubMode === 'link' && (
                <form onSubmit={handleAddLink} className="mt-5 flex items-center gap-2 max-w-sm mx-auto">
                  <input
                    type="url"
                    required
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#202024] text-slate-800 dark:text-zinc-200 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-medium"
                  >
                    Add
                  </button>
                </form>
              )}

              {activeSubMode === 'library' && (
                <div className="mt-5 max-w-sm mx-auto text-left bg-white dark:bg-[#202024] border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 max-h-36 overflow-y-auto">
                  {libraryLoading ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">
                      Loading library...
                    </p>
                  ) : libraryItems.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-2">
                      No previously uploaded files in library yet.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {libraryItems.map((item, idx) => (
                        <button
                          key={`${item.fileName}-${idx}`}
                          type="button"
                          onClick={() => handleSelectFromLibrary(item)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs text-slate-700 dark:text-zinc-200"
                        >
                          <span className="truncate">{item.fileName}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {formatFileSize(item.fileSizeBytes)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {stagedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024]/50"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.fileName}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#18181B] flex items-center justify-center text-slate-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">
                        {file.fileName}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        {file.externalUrl ? file.externalUrl : formatFileSize(file.fileSizeBytes)}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5">
                        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={file.optimize}
                            onChange={(e) =>
                              setStagedFiles((prev) =>
                                prev.map((x) =>
                                  x.id === file.id ? { ...x, optimize: e.target.checked } : x
                                )
                              )
                            }
                            className="rounded border-slate-300 dark:border-zinc-600"
                          />
                          <span>Optimize</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={file.isPrivate}
                            onChange={(e) =>
                              setStagedFiles((prev) =>
                                prev.map((x) =>
                                  x.id === file.id ? { ...x, isPrivate: e.target.checked } : x
                                )
                              )
                            }
                            className="rounded border-slate-300 dark:border-zinc-600"
                          />
                          <span>Private</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    {file.previewUrl && (
                      <span title="Image preview" className="p-1">
                        <Crop className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setStagedFiles((prev) => prev.filter((x) => x.id !== file.id))
                      }
                      className="p-1 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {hasPublicFile && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 px-3.5 py-2.5 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  This file is public and can be accessed by anyone, even without logging in. Mark it private to limit access.
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => deviceInputRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <Plus className="w-3 h-3" /> Add more files
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-[#27272A]">
          <button
            type="button"
            onClick={handleSetAllPrivate}
            disabled={stagedFiles.length === 0 || isUploading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#202024] text-slate-700 dark:text-zinc-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-[#27272A] disabled:opacity-50 transition-colors"
          >
            Set all private
          </button>
          <button
            type="button"
            onClick={handleConfirmUpload}
            disabled={stagedFiles.length === 0 || isUploading}
            className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};
