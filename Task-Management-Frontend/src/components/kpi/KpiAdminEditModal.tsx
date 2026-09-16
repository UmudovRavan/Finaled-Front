import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    ShieldAlert,
    Star,
    ClipboardCheck,
    Calculator,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Trash2,
    FilePenLine,
    AlertTriangle,
} from 'lucide-react';
import { kpiService, getKpiErrorMessage } from '../../api';
import type { DailyKpiDTO, UpdateDailyKpiDTO } from '../../dto';
import KpiScoreBadge from './KpiScoreBadge';

interface KpiAdminEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedKpi: DailyKpiDTO) => void;
    onDeleteSuccess?: (deletedId: string) => void;
    kpi: DailyKpiDTO | null;
}

export const KpiAdminEditModal: React.FC<KpiAdminEditModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onDeleteSuccess,
    kpi,
}) => {
    const [dutyScore, setDutyScore] = useState<number>(1);
    const [disciplineScore, setDisciplineScore] = useState<number>(0);
    const [disciplinePenaltyReason, setDisciplinePenaltyReason] = useState<string>('');
    const [bonusScore, setBonusScore] = useState<number>(0);
    const [bonusReason, setBonusReason] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [adminEditReason, setAdminEditReason] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && kpi) {
            setDutyScore(kpi.jobDutiesScore ?? kpi.dutyScore ?? 1);
            setDisciplineScore(kpi.disciplineScore ?? 0);
            setDisciplinePenaltyReason(kpi.disciplinePenaltyReason || '');
            setBonusScore(kpi.bonusScore ?? 0);
            setBonusReason(kpi.bonusReason || '');
            setNotes(kpi.comments ?? kpi.notes ?? '');
            setAdminEditReason('');
            setShowDeleteConfirm(false);
            setErrorMessage(null);
        }
    }, [isOpen, kpi]);

    const calculatedTotalScore = useMemo(() => {
        return dutyScore + disciplineScore + bonusScore;
    }, [dutyScore, disciplineScore, bonusScore]);

    const isDisciplineInvalid = disciplineScore === -1 && !disciplinePenaltyReason.trim();
    const isAdminReasonInvalid = !adminEditReason.trim();
    const canSubmit = !loading && !deleting && !isDisciplineInvalid && !isAdminReasonInvalid;

    if (!isOpen || !kpi) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setLoading(true);
        setErrorMessage(null);

        const payload: UpdateDailyKpiDTO = {
            jobDutiesScore: dutyScore,
            disciplineScore,
            disciplinePenaltyReason: disciplineScore === -1 ? disciplinePenaltyReason.trim() : null,
            bonusScore,
            bonusReason: bonusScore === 1 ? (bonusReason.trim() || null) : null,
            comments: notes.trim() || null,
            adminEditReason: adminEditReason.trim(),
        };

        try {
            const updated = await kpiService.updateKpi(kpi.id, payload);
            onSuccess(updated);
            onClose();
        } catch (err: any) {
            setErrorMessage(getKpiErrorMessage(err, 'KPI redaktə edilərkən xəta baş verdi.'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setErrorMessage(null);

        try {
            await kpiService.deleteKpi(kpi.id);
            if (onDeleteSuccess) {
                onDeleteSuccess(kpi.id);
            }
            onClose();
        } catch (err: any) {
            setErrorMessage(getKpiErrorMessage(err, 'KPI silinərkən xəta baş verdi.'));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-150 font-sans">
            <div
                className="w-full max-w-xl bg-[#121214] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#F4F4F5] animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#27272A] bg-[#18181B] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/20 via-fuchsia-500/15 to-indigo-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-md shadow-purple-500/10 shrink-0">
                            <FilePenLine className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate flex items-center gap-2">
                                <span>Admin KPI Düzəlişi</span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/30">
                                    Admin Audit
                                </span>
                            </h2>
                            <p className="text-xs text-[#A1A1AA] truncate">
                                {kpi.employeeName} {kpi.divisionName ? `• ${kpi.divisionName}` : ''} • Tarix: <span className="text-purple-400 font-semibold">{kpi.date}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Form */}
                <form id="kpi-admin-edit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
                    {/* Error */}
                    {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{errorMessage}</span>
                        </div>
                    )}

                    {/* Previous Evaluator Info */}
                    <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between text-xs">
                        <span className="text-[#A1A1AA]">
                            İlkin qiymətləndirən: <b className="text-white">{kpi.evaluatorName || 'Sistem'}</b>
                        </span>
                        {kpi.isAdminEdited && (
                            <span className="text-amber-400 font-medium text-[11px]">
                                Əvvəllər admin tərəfindən düzəliş edilib
                            </span>
                        )}
                    </div>

                    {/* Metric 1: Vəzifə Öhdəliyi */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 font-black text-[10px] flex items-center justify-center border border-emerald-500/25 shadow-xs">
                                    01
                                </span>
                                <label className="text-xs font-bold text-[#F4F4F5]">
                                    Vəzifə Öhdəliyi və Tapşırıqlar
                                </label>
                            </div>
                            <span className="text-[11px] text-[#A1A1AA]">
                                Seçim: <b className={dutyScore === 1 ? 'text-emerald-400' : 'text-[#A1A1AA]'}>{dutyScore === 1 ? '+1 Bal' : '0 Bal'}</b>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDutyScore(1)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    dutyScore === 1
                                        ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                                        : 'border-[#27272A] bg-[#18181B] hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-400">+1 Müsbət</span>
                                    {dutyScore === 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                </div>
                                <span className="text-[11px] text-[#A1A1AA]">Öhdəlik tam yerinə yetirilib</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDutyScore(0)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    dutyScore === 0
                                        ? 'border-[#71717A]/50 bg-zinc-800/50 ring-1 ring-zinc-500/30'
                                        : 'border-[#27272A] bg-[#18181B] hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#D4D4D8]">0 Neytral</span>
                                    {dutyScore === 0 && <CheckCircle2 className="w-4 h-4 text-[#D4D4D8]" />}
                                </div>
                                <span className="text-[11px] text-[#A1A1AA]">Qismən və ya gözlənilən nəticə yoxdur</span>
                            </button>
                        </div>
                    </div>

                    {/* Metric 2: İntizam Pozuntusu */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-rose-500/15 text-rose-400 font-black text-[10px] flex items-center justify-center border border-rose-500/25 shadow-xs">
                                    02
                                </span>
                                <label className="text-xs font-bold text-[#F4F4F5]">
                                    İntizam və Daxili Qaydalar
                                </label>
                            </div>
                            <span className="text-[11px] text-[#A1A1AA]">
                                Seçim: <b className={disciplineScore === -1 ? 'text-rose-400' : 'text-[#A1A1AA]'}>{disciplineScore === -1 ? '-1 Cərimə' : '0 Neytral'}</b>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDisciplineScore(0)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    disciplineScore === 0
                                        ? 'border-blue-500/40 bg-gradient-to-br from-blue-500/15 to-blue-500/5 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/30'
                                        : 'border-[#27272A] bg-[#18181B] hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#F4F4F5]">0 Pozuntu Yoxdur</span>
                                    {disciplineScore === 0 && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                </div>
                                <span className="text-[11px] text-[#A1A1AA]">İntizam qaydalarına riayət olunub</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDisciplineScore(-1)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    disciplineScore === -1
                                        ? 'border-rose-500/50 bg-gradient-to-br from-rose-500/15 to-rose-500/5 shadow-md shadow-rose-500/10 ring-1 ring-rose-500/30'
                                        : 'border-[#27272A] bg-[#18181B] hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-rose-400">-1 Cərimə / Pozuntu</span>
                                    {disciplineScore === -1 && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                                </div>
                                <span className="text-[11px] text-[#A1A1AA]">Qayda pozuntusu qeydə alınıb</span>
                            </button>
                        </div>

                        {disciplineScore === -1 && (
                            <div className="pt-1 space-y-1 animate-in fade-in duration-150">
                                <label className="text-[11px] font-bold text-rose-400">
                                    İntizam Səbəbi *
                                </label>
                                <textarea
                                    value={disciplinePenaltyReason}
                                    onChange={(e) => setDisciplinePenaltyReason(e.target.value)}
                                    placeholder="Pozuntu səbəbini daxil edin..."
                                    rows={2}
                                    className={`w-full px-3 py-2 rounded-xl bg-[#18181B] border text-xs text-white placeholder-[#71717A] focus:outline-none transition-all resize-none ${
                                        isDisciplineInvalid ? 'border-rose-500/60' : 'border-[#27272A] focus:border-purple-500'
                                    }`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Metric 3: Bonus */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-400 font-black text-[10px] flex items-center justify-center border border-amber-500/25 shadow-xs">
                                    03
                                </span>
                                <label className="text-xs font-bold text-[#F4F4F5]">
                                    Bonus və Fərqlənmə (Təşəbbüs)
                                </label>
                            </div>
                            <span className="text-[11px] text-[#A1A1AA]">
                                Seçim: <b className={bonusScore === 1 ? 'text-amber-400' : 'text-[#A1A1AA]'}>{bonusScore === 1 ? '+1 Bonus' : '0 Standart'}</b>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setBonusScore(0)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    bonusScore === 0
                                        ? 'border-[#71717A]/40 bg-zinc-800/50 ring-1 ring-zinc-500/30'
                                        : 'border-[#27272A] bg-[#18181B] hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#D4D4D8]">0 Standart</span>
                                    {bonusScore === 0 && <CheckCircle2 className="w-4 h-4 text-[#D4D4D8]" />}
                                </div>
                                <span className="text-[11px] text-[#A1A1AA]">Xüsusi fərqlənmə yoxdur</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setBonusScore(1)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    bonusScore === 1
                                        ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/15 to-amber-500/5 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                                        : 'border-[#27272A] bg-[#18181B] hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-400">+1 Bonus</span>
                                    {bonusScore === 1 && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                                </div>
                                <span className="text-[11px] text-[#A1A1AA]">Xüsusi fərqlənmə / təşəbbüs</span>
                            </button>
                        </div>

                        {bonusScore === 1 && (
                            <div className="pt-1 space-y-1 animate-in fade-in duration-150">
                                <label className="text-[11px] font-bold text-amber-400">
                                    Bonus Səbəbi
                                </label>
                                <textarea
                                    value={bonusReason}
                                    onChange={(e) => setBonusReason(e.target.value)}
                                    placeholder="Bonus səbəbini qeyd edin..."
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] focus:border-amber-500/60 text-xs text-white placeholder-[#71717A] focus:outline-none transition-all resize-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Admin Edit Audit Reason (MANDATORY) */}
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                        <label className="text-xs font-bold text-purple-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-purple-400" />
                                Admin Düzəliş Səbəbi (Audit üçün MƏCBURİ) *
                            </span>
                            {isAdminReasonInvalid && (
                                <span className="text-[10px] text-purple-400 font-normal">Doldurulmalıdır</span>
                            )}
                        </label>
                        <textarea
                            value={adminEditReason}
                            onChange={(e) => setAdminEditReason(e.target.value)}
                            placeholder="Məsələn: Menecerin texniki səhvi düzəldildi; əməkdaşın rəsmi icazə sənədi təqdim olundu..."
                            rows={2}
                            className={`w-full px-3 py-2 rounded-xl bg-[#18181B] border text-xs text-white placeholder-[#71717A] focus:outline-none transition-all resize-none ${
                                isAdminReasonInvalid
                                    ? 'border-purple-500/50 focus:border-purple-400'
                                    : 'border-purple-500/30 focus:border-purple-400'
                            }`}
                        />
                    </div>

                    {/* Live Preview */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#1C1C1E] to-[#18181B] border border-[#27272A] flex items-center justify-between shadow-lg shadow-black/20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xs shrink-0">
                                <Calculator className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white">Yenilənmiş Yekun Bal:</span>
                        </div>
                        <KpiScoreBadge score={calculatedTotalScore} size="lg" showLabel />
                    </div>

                    {/* Delete Confirmation Box or Delete Button */}
                    {showDeleteConfirm ? (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Bu günlük KPI qiymətləndirməsini silmək istədiyinizə əminsiniz?</span>
                            </div>
                            <p className="text-[11px] text-[#A1A1AA]">
                                Bu əməliyyat geri qaytarıla bilməz və əməkdaşın aylıq statistikasından silinəcəkdir.
                            </p>
                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    className="px-3 py-1.5 rounded-lg bg-[#27272A] text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                    <span>Bəli, Sil</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between pt-1">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Bu Qiymətləndirməni Sil</span>
                            </button>
                        </div>
                    )}
                </form>

                {/* Fixed Footer */}
                <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-[#27272A] bg-[#18181B] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading || deleting}
                        className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Bağla
                    </button>
                    <button
                        type="submit"
                        form="kpi-admin-edit-form"
                        disabled={!canSubmit}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Düzəliş qeyd edilir...</span>
                            </>
                        ) : (
                            <span>Düzəlişi Təsdiqlə (Audit)</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KpiAdminEditModal;
