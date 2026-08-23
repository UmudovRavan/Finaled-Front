import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export type ActionModalVariant = 'danger' | 'warning' | 'primary' | 'success';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title: string;
  description?: string;
  itemHighlight?: string;
  variant?: ActionModalVariant;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  showReasonInput?: boolean;
  reasonPlaceholder?: string;
  reasonLabel?: string;
  isReasonRequired?: boolean;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemHighlight,
  variant = 'warning',
  icon,
  confirmText,
  cancelText,
  showReasonInput = false,
  reasonPlaceholder,
  reasonLabel,
  isReasonRequired = false
}) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const finalConfirmText = confirmText || t('common.confirm', {}, 'Təsdiq Et');
  const finalCancelText = cancelText || t('common.cancel', {}, 'Ləğv Et');
  const finalReasonLabel = reasonLabel || t('common.actions', {}, 'Əməliyyat Səbəbi');
  const finalReasonPlaceholder = reasonPlaceholder || t('common.searchPlaceholder', {}, 'Səbəbi qeyd edin...');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setLoading(false);
      setTimeout(() => {
        if (showReasonInput && inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, showReasonInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReasonRequired && !reason.trim()) {
      return;
    }
    setLoading(true);
    try {
      await onConfirm(reason.trim() || undefined);
      onClose();
    } catch {
      // errors handled by caller via toasts
    } finally {
      setLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
          btnClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20',
          defaultIcon: 'delete_forever'
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
          btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20',
          defaultIcon: 'check_circle'
        };
      case 'primary':
        return {
          iconBg: 'bg-[#D946EF]/15 text-[#D946EF] border border-[#D946EF]/30',
          btnClass: 'bg-[#D946EF] hover:bg-[#C026D3] text-white shadow-lg shadow-[#D946EF]/20',
          defaultIcon: 'tune'
        };
      case 'warning':
      default:
        return {
          iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
          btnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20',
          defaultIcon: 'warning'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${vStyles.iconBg}`}
            >
              <span className="material-symbols-outlined text-xl">
                {icon || vStyles.defaultIcon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              {description && (
                <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">{description}</p>
              )}
              {itemHighlight && (
                <div className="mt-2 px-2.5 py-1.5 bg-[#121214] border border-[#27272A] rounded-xl text-xs font-mono font-semibold text-[#D946EF] truncate">
                  {itemHighlight}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-[#71717A] hover:text-white p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Reason Input Field */}
          {showReasonInput && (
            <div className="pt-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {finalReasonLabel} {isReasonRequired && <span className="text-rose-400">*</span>}
              </label>
              <textarea
                ref={inputRef}
                rows={3}
                required={isReasonRequired}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={finalReasonPlaceholder}
                className="w-full crm-input text-xs resize-none placeholder-[#71717A]"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold btn-secondary rounded-xl cursor-pointer disabled:opacity-50"
            >
              {finalCancelText}
            </button>
            <button
              type="submit"
              disabled={loading || (isReasonRequired && !reason.trim())}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 ${vStyles.btnClass}`}
            >
              {loading && (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              )}
              <span>{loading ? t('common.loading', {}, 'İcra olunur...') : finalConfirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionConfirmModal;
