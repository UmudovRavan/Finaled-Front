import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Loader2,
    Check,
    Minus,
    Calculator,
    Briefcase,
    ShieldCheck,
    Sparkles,
    AlertCircle,
} from 'lucide-react';
import { kpiService, getKpiErrorMessage } from '../../api';
import type { DailyKpiDTO, CreateDailyKpiDTO } from '../../dto';
import KpiScoreBadge from './KpiScoreBadge';
import { useLanguage } from '../../context/LanguageContext';

interface KpiSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (savedKpi: DailyKpiDTO) => void;
    userId?: string;
    employeeId?: string;
    employeeName: string;
    divisionName?: string;
    date?: string; // YYYY-MM-DD, defaults to today
    initialData?: DailyKpiDTO | null;
    currentUserId?: string;
    isAdminOrHr?: boolean;
}

export const KpiSubmitModal: React.FC<KpiSubmitModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    userId,
    employeeId,
    employeeName,
    divisionName,
    date,
    initialData,
    currentUserId,
    isAdminOrHr = false,
}) => {
    const { t } = useLanguage();
    const targetEmployeeId = employeeId || userId || '';

    const targetDate = useMemo(() => {
        if (date) return date;
        if (initialData?.evaluationDate) return initialData.evaluationDate;
        if (initialData?.date) return initialData.date;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, [date, initialData]);

    // Default to 0 for all metrics (0 = unselected / neutral)
    const [dutyScore, setDutyScore] = useState<number>(0);
    const [disciplineScore, setDisciplineScore] = useState<number>(0);
    const [disciplinePenaltyReason, setDisciplinePenaltyReason] = useState<string>('');
    const [bonusScore, setBonusScore] = useState<number>(0);
    const [bonusReason, setBonusReason] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Self-evaluation check
    const isSelfEvaluation = Boolean(
        currentUserId &&
        targetEmployeeId &&
        currentUserId.toLowerCase() === targetEmployeeId.toLowerCase() &&
        !isAdminOrHr
    );

    // Initialize or reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
            if (initialData) {
                setDutyScore(initialData.jobDutiesScore ?? initialData.dutyScore ?? 0);
                setDisciplineScore(initialData.disciplineScore ?? 0);
                setDisciplinePenaltyReason(initialData.disciplinePenaltyReason || '');
                setBonusScore(initialData.bonusScore ?? 0);
                setBonusReason(initialData.bonusReason || '');
                setNotes(initialData.comments ?? initialData.notes ?? '');
            } else {
                setDutyScore(0);
                setDisciplineScore(0);
                setDisciplinePenaltyReason('');
                setBonusScore(0);
                setBonusReason('');
                setNotes('');
            }
        }
    }, [isOpen, initialData]);

    // Toggle handlers: clicking an active option deselects back to 0
    const handleToggleDuty = (val: 1 | -1) => {
        setDutyScore((prev) => (prev === val ? 0 : val));
    };

    const handleToggleDiscipline = (val: 1 | -1) => {
        setDisciplineScore((prev) => (prev === val ? 0 : val));
    };

    const handleToggleBonus = (val: 1 | -1) => {
        setBonusScore((prev) => (prev === val ? 0 : val));
    };

    // Live total calculation
    const calculatedTotalScore = useMemo(() => {
        return (dutyScore || 0) + (disciplineScore || 0) + (bonusScore || 0);
    }, [dutyScore, disciplineScore, bonusScore]);

    // Validation
    const isDisciplineInvalid = disciplineScore === -1 && !disciplinePenaltyReason.trim();
    const isEmployeeIdMissing = !targetEmployeeId.trim();
    const canSubmit = !loading && !isDisciplineInvalid && !isEmployeeIdMissing && !isSelfEvaluation;

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) {
            if (isEmployeeIdMissing) {
                setErrorMessage(t('kpi.submitModal.errorNoEmployeeId', {}, 'Əməkdaş ID-si təyin edilməyib.'));
            }
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        const payload: CreateDailyKpiDTO = {
            employeeId: targetEmployeeId,
            jobDutiesScore: dutyScore,
            disciplineScore,
            disciplinePenaltyReason: disciplineScore === -1 ? disciplinePenaltyReason.trim() : null,
            bonusScore,
            bonusReason: bonusScore === 1 ? (bonusReason.trim() || null) : null,
            comments: notes.trim() || null,
        };

        try {
            const saved = await kpiService.submitDailyKpi(payload);
            onSuccess(saved);
            onClose();
        } catch (err: any) {
            setErrorMessage(getKpiErrorMessage(err, t('kpi.submitModal.errorSubmitting', {}, 'KPI qiymətləndirməsi göndərilərkən xəta baş verdi.')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-[#161618] border border-zinc-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] text-zinc-900 dark:text-[#F4F4F5] my-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* iOS Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/70 dark:bg-white/[0.02] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                                {initialData ? t('kpi.updateKpiTitle', {}, 'KPI Qiymətləndirməsini Yenilə') : t('kpi.submitKpiTitle', {}, 'Günlük KPI Qiymətləndirilməsi')}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] truncate flex items-center gap-1.5 mt-0.5">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">{employeeName}</span>
                                {divisionName && <span>• {divisionName}</span>}
                                <span>• {t('common.dueDate', {}, 'Son Tarix')}: <b className="text-blue-600 dark:text-blue-400 font-semibold">{targetDate}</b></span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="kpi-submit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
                    {/* Self-evaluation warning */}
                    {isSelfEvaluation && (
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                            <div className="leading-relaxed">
                                <b className="block text-zinc-900 dark:text-white font-semibold">{t('kpi.selfEvalWarning', {}, 'Özünü qiymətləndirmə məhdudiyyəti')}</b>
                                {t('kpi.selfEvalDesc', {}, 'Sistem qaydalarına əsasən, menecer öz fəaliyyətinə KPI balı daxil edə bilməz. Sizin fəaliyyətiniz rəhbərlik və ya HR tərəfindən qiymətləndirilir.')}
                            </div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{errorMessage}</span>
                        </div>
                    )}

                    {/* Metric 1: Vəzifə Öhdəliyi və Tapşırıqlar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-3.5 h-3.5" />
                                </div>
                                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                    {t('kpi.dutySectionTitle', {}, 'Vəzifə Öhdəliyi və Tapşırıqlar')}
                                </label>
                            </div>
                            <div>
                                {dutyScore === 1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        +1 {t('common.points', {}, 'Bal')}
                                    </span>
                                ) : dutyScore === -1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        -1 {t('common.points', {}, 'Bal')}
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/[0.05]">
                                        0 {t('common.none', {}, 'Neytral')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {/* +1 Button */}
                            <button
                                type="button"
                                onClick={() => handleToggleDuty(1)}
                                className={`group p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all duration-150 cursor-pointer ${
                                    dutyScore === 1
                                        ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.14] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/20'
                                        : 'bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-[#18181B]/80 dark:hover:bg-[#202024] border-zinc-200/70 dark:border-[#27272A] text-zinc-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${dutyScore === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                        +1 {t('kpi.dutyFulfilled', {}, 'İcra olundu')}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                        dutyScore === 1
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'border border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                    }`}>
                                        {dutyScore === 1 && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] leading-snug">
                                    {t('kpi.dutyFullDesc', {}, 'Vəzifə və tapşırıqlar tam yerinə yetirilib')}
                                </span>
                            </button>

                            {/* -1 Button */}
                            <button
                                type="button"
                                onClick={() => handleToggleDuty(-1)}
                                className={`group p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all duration-150 cursor-pointer ${
                                    dutyScore === -1
                                        ? 'bg-rose-500/[0.08] dark:bg-rose-500/[0.14] border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-rose-500/20'
                                        : 'bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-[#18181B]/80 dark:hover:bg-[#202024] border-zinc-200/70 dark:border-[#27272A] text-zinc-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${dutyScore === -1 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                        -1 {t('kpi.dutyNotFulfilled', {}, 'İcra olunmadı')}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                        dutyScore === -1
                                            ? 'bg-rose-500 text-white shadow-xs'
                                            : 'border border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                    }`}>
                                        {dutyScore === -1 && <Minus className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] leading-snug">
                                    {t('kpi.dutyNotFulfilledDesc', {}, 'Öhdəliklər və ya tapşırıqlar yerinə yetirilməyib')}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Metric 2: İntizam və Daxili Qaydalar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                </div>
                                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                    {t('kpi.disciplineSectionTitle', {}, 'İntizam və Daxili Qaydalar')}
                                </label>
                            </div>
                            <div>
                                {disciplineScore === 1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        +1 {t('kpi.disciplineExemplary', {}, 'Nümunəvi')}
                                    </span>
                                ) : disciplineScore === -1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        -1 {t('kpi.disciplinePenalty', {}, 'Cərimə')}
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/[0.05]">
                                        0 {t('kpi.disciplineNormal', {}, 'Qaydasında')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {/* +1 Button */}
                            <button
                                type="button"
                                onClick={() => handleToggleDiscipline(1)}
                                className={`group p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all duration-150 cursor-pointer ${
                                    disciplineScore === 1
                                        ? 'bg-emerald-500/[0.08] dark:bg-emerald-500/[0.14] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/20'
                                        : 'bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-[#18181B]/80 dark:hover:bg-[#202024] border-zinc-200/70 dark:border-[#27272A] text-zinc-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${disciplineScore === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                        +1 {t('kpi.disciplineExemplary', {}, 'Nümunəvi İntizam')}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                        disciplineScore === 1
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'border border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                    }`}>
                                        {disciplineScore === 1 && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] leading-snug">
                                    {t('kpi.disciplineExemplaryDesc', {}, 'Qaydalara tam riayət və vaxtında davamiyyət')}
                                </span>
                            </button>

                            {/* -1 Button */}
                            <button
                                type="button"
                                onClick={() => handleToggleDiscipline(-1)}
                                className={`group p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all duration-150 cursor-pointer ${
                                    disciplineScore === -1
                                        ? 'bg-rose-500/[0.08] dark:bg-rose-500/[0.14] border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-rose-500/20'
                                        : 'bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-[#18181B]/80 dark:hover:bg-[#202024] border-zinc-200/70 dark:border-[#27272A] text-zinc-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${disciplineScore === -1 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                        -1 {t('kpi.disciplinePenalty', {}, 'Qayda Pozuntusu')}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                        disciplineScore === -1
                                            ? 'bg-rose-500 text-white shadow-xs'
                                            : 'border border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                    }`}>
                                        {disciplineScore === -1 && <Minus className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] leading-snug">
                                    {t('kpi.disciplinePenaltyDesc', {}, 'Gecikmə, icazəsiz getmə və ya qayda pozuntusu')}
                                </span>
                            </button>
                        </div>

                        {/* Mandatory Reason if Discipline is -1 */}
                        {disciplineScore === -1 && (
                            <div className="pt-1 space-y-1.5 animate-in fade-in duration-150">
                                <label className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                    <span>{t('kpi.disciplineReasonReq', {}, 'İntizam Pozuntusunun Səbəbi *')}</span>
                                    <span className="text-[10px] text-zinc-400 dark:text-[#71717A] font-normal">{t('kpi.disciplineReasonDesc', {}, '(Mütləq qeyd edilməlidir)')}</span>
                                </label>
                                <textarea
                                    value={disciplinePenaltyReason}
                                    onChange={(e) => setDisciplinePenaltyReason(e.target.value)}
                                    placeholder={t('kpi.disciplineReasonPlaceholder', {}, 'Məsələn: İşə 45 dəqiqə gecikmə və xəbərdarlıq edilməməsi...')}
                                    rows={2}
                                    className={`w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50/60 dark:bg-[#18181B] border text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#71717A] focus:outline-none transition-all resize-none ${
                                        isDisciplineInvalid
                                            ? 'border-rose-500/60 focus:border-rose-500 ring-1 ring-rose-500/20'
                                            : 'border-zinc-200 dark:border-[#27272A] focus:border-blue-500'
                                    }`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Metric 3: Bonus və Fərqlənmə (Təşəbbüs) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                    {t('kpi.bonusSectionTitle', {}, 'Bonus və Fərqlənmə (Təşəbbüs)')}
                                </label>
                            </div>
                            <div>
                                {bonusScore === 1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        +1 {t('kpi.bonus', {}, 'Bonus')}
                                    </span>
                                ) : bonusScore === -1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                        -1 {t('common.points', {}, 'Bal')}
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-white/[0.05]">
                                        0 {t('kpi.bonusStandard', {}, 'Standart')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {/* +1 Button */}
                            <button
                                type="button"
                                onClick={() => handleToggleBonus(1)}
                                className={`group p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all duration-150 cursor-pointer ${
                                    bonusScore === 1
                                        ? 'bg-amber-500/[0.08] dark:bg-amber-500/[0.14] border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs ring-1 ring-amber-500/20'
                                        : 'bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-[#18181B]/80 dark:hover:bg-[#202024] border-zinc-200/70 dark:border-[#27272A] text-zinc-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${bonusScore === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-800 dark:text-zinc-200'} flex items-center gap-1`}>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                                        +1 {t('kpi.bonusSpecial', {}, 'Bonus / Təşəbbüs')}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                        bonusScore === 1
                                            ? 'bg-amber-500 text-white shadow-xs'
                                            : 'border border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                    }`}>
                                        {bonusScore === 1 && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] leading-snug">
                                    {t('kpi.bonusSpecialDesc', {}, 'Fövqəladə səmərəlilik və ya böyük uğur')}
                                </span>
                            </button>

                            {/* -1 Button */}
                            <button
                                type="button"
                                onClick={() => handleToggleBonus(-1)}
                                className={`group p-3 sm:p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all duration-150 cursor-pointer ${
                                    bonusScore === -1
                                        ? 'bg-rose-500/[0.08] dark:bg-rose-500/[0.14] border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-rose-500/20'
                                        : 'bg-zinc-50/70 hover:bg-zinc-100/80 dark:bg-[#18181B]/80 dark:hover:bg-[#202024] border-zinc-200/70 dark:border-[#27272A] text-zinc-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${bonusScore === -1 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                        -1 {t('kpi.bonusPassive', {}, 'Passivlik / Xəta')}
                                    </span>
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                        bonusScore === -1
                                            ? 'bg-rose-500 text-white shadow-xs'
                                            : 'border border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400'
                                    }`}>
                                        {bonusScore === -1 && <Minus className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] leading-snug">
                                    {t('kpi.bonusPassiveDesc', {}, 'Ciddi səhlənkarlıq və ya təşəbbüssüzlük')}
                                </span>
                            </button>
                        </div>

                        {/* Optional Bonus Reason if Bonus is +1 */}
                        {bonusScore === 1 && (
                            <div className="pt-1 space-y-1.5 animate-in fade-in duration-150">
                                <label className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    {t('kpi.bonusReasonLabel', {}, 'Bonus / Fərqlənmə Səbəbi (İstəyə bağlı)')}
                                </label>
                                <textarea
                                    value={bonusReason}
                                    onChange={(e) => setBonusReason(e.target.value)}
                                    placeholder={t('kpi.bonusReasonPlaceholder', {}, 'Məsələn: Gecə saatlarında kritik server problemini operativ həll etdi...')}
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50/60 dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] focus:border-amber-500/60 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#71717A] focus:outline-none transition-all resize-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* General Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                            {t('kpi.notesLabel', {}, 'Ümumi Qeyd və Rəy (İstəyə bağlı)')}
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={t('kpi.notesPlaceholder', {}, 'Əməkdaş haqqında əlavə qeydləriniz...')}
                            rows={2}
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50/60 dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] focus:border-blue-500 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#71717A] focus:outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Live Score Preview iOS Card */}
                    <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-[#1C1C1E]/80 border border-zinc-200/80 dark:border-white/[0.06] flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Calculator className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-zinc-900 dark:text-white block tracking-tight">
                                    {t('kpi.calculatedScore', {}, 'Yekun Hesablanan Bal')}
                                </span>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] font-mono">
                                    ({dutyScore >= 0 ? `+${dutyScore}` : dutyScore} {t('kpi.dutyObligation', {}, 'Öhdəlik')}) + ({disciplineScore >= 0 ? `+${disciplineScore}` : disciplineScore} {t('kpi.discipline', {}, 'İntizam')}) + ({bonusScore >= 0 ? `+${bonusScore}` : bonusScore} {t('kpi.bonus', {}, 'Bonus')})
                                </span>
                            </div>
                        </div>
                        <div>
                            <KpiScoreBadge score={calculatedTotalScore} size="lg" showLabel />
                        </div>
                    </div>
                </form>

                {/* iOS Footer */}
                <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-zinc-100 dark:border-white/[0.06] bg-zinc-50/70 dark:bg-white/[0.02] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl bg-zinc-200/80 dark:bg-[#27272A] hover:bg-zinc-300 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {t('common.cancel', {}, 'İmtina')}
                    </button>
                    <button
                        type="submit"
                        form="kpi-submit-form"
                        disabled={!canSubmit}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{t('common.loading', {}, 'Yadda saxlanılır...')}</span>
                            </>
                        ) : (
                            <span>{t('kpi.confirmEvaluation', {}, 'Qiymətləndirməni Təsdiqlə')}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KpiSubmitModal;
