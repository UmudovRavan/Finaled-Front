import React, { useEffect, useState } from 'react';
import { Paperclip, Tag, Share2, X, Plus, Lock, Unlock } from 'lucide-react';
import { stockService } from '../../api/stockService';
import { toast } from '../../utils/toast';
import {
  UploadAttachmentModal,
  saveToAttachmentLibrary,
  type StagedAttachmentFile,
} from './UploadAttachmentModal';
import { ShareDocumentModal, type DocumentShareEntry } from './ShareDocumentModal';

interface DocumentSidebarMetaProps {
  docType: string;
  docId?: string;
  docName?: string;
}

const TAG_PALETTE = [
  { bg: '#FFF1E6', text: '#C25E00', hex: '#C25E00' }, // warm orange (Image 7)
  { bg: '#E6F4EA', text: '#137333', hex: '#137333' }, // soft green (Image 7)
  { bg: '#E8F0FE', text: '#1967D2', hex: '#1967D2' }, // soft blue
  { bg: '#F3E8FD', text: '#7627BB', hex: '#7627BB' }, // soft purple
  { bg: '#FCE8E6', text: '#C5221F', hex: '#C5221F' }, // soft rose
];

function getTagStyle(tagName: string, colorHex?: string) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
  if (colorHex && colorHex !== '#3B82F6') {
    const matched = TAG_PALETTE.find((p) => p.hex.toLowerCase() === colorHex.toLowerCase());
    if (matched) return matched;
  }
  return palette;
}

export const DocumentSidebarMeta: React.FC<DocumentSidebarMetaProps> = ({
  docType,
  docId,
  docName,
}) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [shares, setShares] = useState<DocumentShareEntry[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  // In-session preview URL cache so clicking an uploaded file opens/downloads immediately
  const [localPreviewMap, setLocalPreviewMap] = useState<Record<string, string>>({});

  const loadMeta = async () => {
    if (!docId) return;
    try {
      const [att, tg, sh] = await Promise.all([
        stockService.getDocumentAttachments(docType, docId).catch(() => []),
        stockService.getDocumentTags(docType, docId).catch(() => []),
        stockService.getDocumentShares(docType, docId).catch(() => []),
      ]);
      setAttachments(att);
      setTags(tg);
      setShares(sh);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadMeta();
  }, [docType, docId]);

  const handleUploadFiles = async (files: StagedAttachmentFile[]) => {
    if (!docId) return;
    let uploadedCount = 0;
    for (const f of files) {
      try {
        const created = await stockService.addDocumentAttachment(docType, docId, {
          fileName: f.fileName,
          contentType: f.contentType,
          fileSizeBytes: f.fileSizeBytes,
          base64Content: f.base64Content,
          externalUrl: f.externalUrl,
          sourceType: f.sourceType,
          libraryAttachmentId: f.libraryAttachmentId,
          storagePath: f.storagePath,
          optimize: f.optimize,
          isPrivate: f.isPrivate,
        });
        saveToAttachmentLibrary({
          fileName: f.fileName,
          contentType: f.contentType,
          fileSizeBytes: f.fileSizeBytes,
          base64Content: f.base64Content,
          externalUrl: f.externalUrl,
        });
        if (created?.id && (f.previewUrl || f.externalUrl || f.base64Content)) {
          const url =
            f.externalUrl ||
            f.previewUrl ||
            `data:${f.contentType};base64,${f.base64Content}`;
          setLocalPreviewMap((prev) => ({ ...prev, [created.id]: url }));
        }
        uploadedCount++;
      } catch {
        toast.error(`Failed to attach ${f.fileName}`);
      }
    }
    if (uploadedCount > 0) {
      await loadMeta();
      toast.success(
        uploadedCount === 1
          ? `Attached ${files[0].fileName}`
          : `Attached ${uploadedCount} files`
      );
    }
  };

  const handleDeleteAttachment = async (attId: string) => {
    try {
      await stockService.deleteDocumentAttachment(attId);
      await loadMeta();
    } catch {
      toast.error('Failed to remove attachment');
    }
  };

  const handleToggleAttachmentVisibility = async (att: any) => {
    try {
      await stockService.updateAttachmentVisibility(att.id, !att.isPrivate);
      await loadMeta();
    } catch {
      toast.error('Failed to update attachment visibility');
    }
  };

  const handleOpenAttachment = async (att: any) => {
    if (att.externalUrl) {
      window.open(att.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const localUrl = localPreviewMap[att.id];
    if (localUrl) {
      window.open(localUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const blob = await stockService.downloadDocumentAttachment(att.id, true);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } catch {
      if (att.storagePath && /^https?:\/\//i.test(att.storagePath)) {
        window.open(att.storagePath, '_blank', 'noopener,noreferrer');
      } else {
        toast.info(`File: ${att.fileName}`);
      }
    }
  };

  const handleAddTagKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowTagInput(false);
      setNewTag('');
      return;
    }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newTag.trim();
    if (!docId || !trimmed) return;
    const style = getTagStyle(trimmed);
    try {
      await stockService.addDocumentTag(docType, docId, trimmed, style.hex);
      setNewTag('');
      setShowTagInput(false);
      await loadMeta();
    } catch {
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    if (!docId) return;
    try {
      await stockService.removeDocumentTag(docType, docId, tagName);
      await loadMeta();
    } catch {
      toast.error('Failed to remove tag');
    }
  };

  const handleUpsertShare = async (
    entry: Omit<DocumentShareEntry, 'id'> & { id?: string }
  ) => {
    if (!docId) return;
    await stockService.upsertDocumentShare(docType, docId, entry);
    await loadMeta();
  };

  const handleDeleteShare = async (shareId: string) => {
    if (!docId) return;
    await stockService.deleteDocumentShare(docType, docId, shareId);
    await loadMeta();
  };

  return (
    <div className="space-y-3.5">
      {/* Attachments */}
      <div>
        <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-zinc-400 mb-1.5">
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Attachments</span>
          </button>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Add Attachment"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-1.5 mt-1.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                title={att.fileName}
                className="flex items-center justify-between gap-2 text-[12px] bg-[#F4F5F7] dark:bg-[#202024] px-2.5 py-1.5 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleAttachmentVisibility(att)}
                    title={att.isPrivate ? 'Private (click to make Public)' : 'Public (click to make Private)'}
                    className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white shrink-0 transition-colors"
                  >
                    {att.isPrivate ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAttachment(att)}
                    className="min-w-0 text-left text-slate-700 dark:text-zinc-200 hover:underline truncate"
                  >
                    {att.fileName}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="text-slate-400 hover:text-red-500 shrink-0 transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-zinc-400 mb-1.5">
          <button
            type="button"
            onClick={() => setShowTagInput((v) => !v)}
            className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Tags</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTagInput((v) => !v)}
            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Add Tag"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showTagInput && (
          <div className="mb-2">
            <input
              type="text"
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTagKeyDown}
              placeholder="Add a tag..."
              className="w-full px-3 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-zinc-700 bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 outline-none focus:border-slate-300 dark:focus:border-zinc-600"
            />
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const style = getTagStyle(t.tagName || '', t.colorHex);
              return (
                <span
                  key={t.id || t.tagName}
                  style={{ backgroundColor: style.bg, color: style.text }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium"
                >
                  <span>{t.tagName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t.tagName)}
                    className="opacity-70 hover:opacity-100 transition-opacity"
                    title="Remove tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Share */}
      <div>
        <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Share Document"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {shares.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {shares.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-[#F4F5F7] dark:bg-[#202024] text-slate-600 dark:text-zinc-300"
              >
                {s.userName}
              </span>
            ))}
          </div>
        )}
      </div>

      <UploadAttachmentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadFiles}
      />

      <ShareDocumentModal
        isOpen={isShareOpen}
        docTitle={docName || docId || docType}
        shares={shares}
        onClose={() => setIsShareOpen(false)}
        onUpsertShare={handleUpsertShare}
        onDeleteShare={handleDeleteShare}
      />
    </div>
  );
};
