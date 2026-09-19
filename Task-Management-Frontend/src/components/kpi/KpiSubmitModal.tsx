import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Award,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Sparkles,
    Calculator,
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

    const [dutyScore, setDutyScore] = useState<number>(1);
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
                setDutyScore(initialData.jobDutiesScore ?? initialData.dutyScore ?? 1);
                setDisciplineScore(initialData.disciplineScore ?? 0);
                setDisciplinePenaltyReason(initialData.disciplinePenaltyReason || '');
                setBonusScore(initialData.bonusScore ?? 0);
                setBonusReason(initialData.bonusReason || '');
                setNotes(initialData.comments ?? initialData.notes ?? '');
            } else {
                setDutyScore(1);
                setDisciplineScore(0);
                setDisciplinePenaltyReason('');
                setBonusScore(0);
                setBonusReason('');
                setNotes('');
            }
        }
    }, [isOpen, initialData]);

    // Live total calculation
    const calculatedTotalScore = useMemo(() => {
        return dutyScore + disciplineScore + bonusScore;
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150 font-sans"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] text-zinc-900 dark:text-[#F4F4F5] my-auto animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Fixed Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#18181B] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-gradient-to-tr dark:from-blue-600/20 dark:via-indigo-500/15 dark:to-purple-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
                            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight truncate flex items-center gap-1.5">
                                <span>{initialData ? t('kpi.updateKpiTitle', {}, 'KPI Qiymətləndirməsini Yenilə') : t('kpi.submitKpiTitle', {}, 'Günlük KPI Qiymətləndirilməsi')}</span>
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] truncate">
                                {employeeName} {divisionName ? `• ${divisionName}` : ''} • {t('common.dueDate', {}, 'Tarix')}: <span className="text-blue-600 dark:text-blue-400 font-semibold">{targetDate}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 dark:text-[#A1A1AA] hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form id="kpi-submit-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
                    {/* Self-evaluation warning */}
                    {isSelfEvaluation && (
                        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <div className="leading-relaxed">
                                <b className="block text-zinc-900 dark:text-white font-semibold">{t('kpi.selfEvalWarning', {}, 'Özünü qiymətləndirmə məhdudiyyəti')}</b>
                                {t('kpi.selfEvalDesc', {}, 'Sistem qaydalarına əsasən, menecer öz fəaliyyətinə KPI balı daxil edə bilməz. Sizin fəaliyyətiniz rəhbərlik və ya HR tərəfindən qiymətləndirilir.')}
                            </div>
                        </div>
                    )}

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{errorMessage}</span>
                        </div>
                    )}

                    {/* Metric 1: Vəzifə Öhdəliyi */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[10px] flex items-center justify-center border border-emerald-500/25 shadow-xs">
                                    01
                                </span>
                                <label className="text-xs font-bold text-zinc-900 dark:text-[#F4F4F5]">
                                    {t('kpi.dutySectionTitle', {}, 'Vəzifə Öhdəliyi və Tapşırıqlar')}
                                </label>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">
                                {t('common.options', {}, 'Seçim')}: <b className={dutyScore === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-[#A1A1AA]'}>{dutyScore === 1 ? '+1 Bal' : '0 Bal'}</b>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDutyScore(1)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    dutyScore === 1
                                        ? 'border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-500/15 shadow-sm ring-1 ring-emerald-500/30'
                                        : 'border-zinc-200 dark:border-[#27272A] bg-zinc-50/50 dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+1 {t('kpi.dutyFulfilled', {}, 'İcra olundu')}</span>
                                    {dutyScore === 1 && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">{t('kpi.dutyFullDesc', {}, 'Vəzifə və tapşırıqlar tam yerinə yetirilib')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDutyScore(0)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    dutyScore === 0
                                        ? 'border-zinc-400 dark:border-[#71717A]/50 bg-zinc-100 dark:bg-zinc-800/50 ring-1 ring-zinc-400 dark:ring-zinc-500/30'
                                        : 'border-zinc-200 dark:border-[#27272A] bg-zinc-50/50 dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-[#D4D4D8]">0 {t('common.none', {}, 'Neytral')}</span>
                                    {dutyScore === 0 && <CheckCircle2 className="w-4 h-4 text-zinc-700 dark:text-[#D4D4D8]" />}
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">{t('kpi.dutyPartialDesc', {}, 'Qismən icra və ya gözlənilən nəticə yoxdur')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Metric 2: İntizam Pozuntusu */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black text-[10px] flex items-center justify-center border border-rose-500/25 shadow-xs">
                                    02
                                </span>
                                <label className="text-xs font-bold text-zinc-900 dark:text-[#F4F4F5]">
                                    {t('kpi.disciplineSectionTitle', {}, 'İntizam və Daxili Qaydalar')}
                                </label>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">
                                {t('common.options', {}, 'Seçim')}: <b className={disciplineScore === -1 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500 dark:text-[#A1A1AA]'}>{disciplineScore === -1 ? '-1 Cərimə' : '0 Neytral'}</b>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDisciplineScore(0)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    disciplineScore === 0
                                        ? 'border-blue-500/40 bg-blue-50/70 dark:bg-blue-500/15 shadow-sm ring-1 ring-blue-500/30'
                                        : 'border-zinc-200 dark:border-[#27272A] bg-zinc-50/50 dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-900 dark:text-[#F4F4F5]">{t('kpi.disciplineNoViolation', {}, '0 Pozuntu Yoxdur')}</span>
                                    {disciplineScore === 0 && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">{t('kpi.disciplineNoViolationDesc', {}, 'İntizam və daxili qaydalara riayət olunub')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setDisciplineScore(-1)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    disciplineScore === -1
                                        ? 'border-rose-500/50 bg-rose-50/70 dark:bg-rose-500/15 shadow-sm ring-1 ring-rose-500/30'
                                        : 'border-zinc-200 dark:border-[#27272A] bg-zinc-50/50 dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">-1 {t('kpi.disciplinePenalty', {}, 'Cərimə / Pozuntu')}</span>
                                    {disciplineScore === -1 && <CheckCircle2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">{t('kpi.disciplinePenaltyDesc', {}, 'Gecikmə, icazəsiz getmə və ya qayda pozuntusu')}</span>
                            </button>
                        </div>

                        {/* Mandatory Reason if Discipline is -1 */}
                        {disciplineScore === -1 && (
                            <div className="pt-1 space-y-1 animate-in fade-in duration-150">
                                <label className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                    <span>{t('kpi.disciplineReasonReq', {}, 'İntizam Pozuntusunun Səbəbi *')}</span>
                                    <span className="text-[10px] text-zinc-400 dark:text-[#71717A] font-normal">{t('kpi.disciplineReasonDesc', {}, '(Mütləq qeyd edilməlidir)')}</span>
                                </label>
                                <textarea
                                    value={disciplinePenaltyReason}
                                    onChange={(e) => setDisciplinePenaltyReason(e.target.value)}
                                    placeholder={t('kpi.disciplineReasonPlaceholder', {}, 'Məsələn: İşə 45 dəqiqə gecikmə və xəbərdarlıq edilməməsi...')}
                                    rows={2}
                                    className={`w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181B] border text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#71717A] focus:outline-none transition-all resize-none ${
                                        isDisciplineInvalid
                                            ? 'border-rose-500/60 focus:border-rose-500'
                                            : 'border-zinc-200 dark:border-[#27272A] focus:border-blue-500'
                                    }`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Metric 3: Bonus / Fərqlənmə */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-[10px] flex items-center justify-center border border-amber-500/25 shadow-xs">
                                    03
                                </span>
                                <label className="text-xs font-bold text-zinc-900 dark:text-[#F4F4F5]">
                                    {t('kpi.bonusSectionTitle', {}, 'Bonus və Fərqlənmə (Təşəbbüs)')}
                                </label>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">
                                {t('common.options', {}, 'Seçim')}: <b className={bonusScore === 1 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-[#A1A1AA]'}>{bonusScore === 1 ? '+1 Bonus' : '0 Neytral'}</b>
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setBonusScore(0)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    bonusScore === 0
                                        ? 'border-zinc-300 dark:border-[#71717A]/40 bg-zinc-100 dark:bg-zinc-800/50 ring-1 ring-zinc-400 dark:ring-zinc-500/30'
                                        : 'border-zinc-200 dark:border-[#27272A] bg-zinc-50/50 dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-700 dark:text-[#D4D4D8]">{t('kpi.bonusStandard', {}, '0 Standart')}</span>
                                    {bonusScore === 0 && <CheckCircle2 className="w-4 h-4 text-zinc-700 dark:text-[#D4D4D8]" />}
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">{t('kpi.bonusStandardDesc', {}, 'Xüsusi əlavə təşəbbüs qeydə alınmayıb')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setBonusScore(1)}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                                    bonusScore === 1
                                        ? 'border-amber-500/50 bg-amber-50/70 dark:bg-amber-500/15 shadow-sm ring-1 ring-amber-500/30'
                                        : 'border-zinc-200 dark:border-[#27272A] bg-zinc-50/50 dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-[#3F3F46]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                                        {t('kpi.bonusSpecial', {}, '+1 Bonus / Təşəbbüs')}
                                    </span>
                                    {bonusScore === 1 && <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                </div>
                                <span className="text-[11px] text-zinc-500 dark:text-[#A1A1AA]">{t('kpi.bonusSpecialDesc', {}, 'Fövqəladə səmərəlilik və ya böyük uğur')}</span>
                            </button>
                        </div>

                        {/* Optional Bonus Reason if Bonus is +1 */}
                        {bonusScore === 1 && (
                            <div className="pt-1 space-y-1 animate-in fade-in duration-150">
                                <label className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    {t('kpi.bonusReasonLabel', {}, 'Bonus / Fərqlənmə Səbəbi (İstəyə bağlı)')}
                                </label>
                                <textarea
                                    value={bonusReason}
                                    onChange={(e) => setBonusReason(e.target.value)}
                                    placeholder={t('kpi.bonusReasonPlaceholder', {}, 'Məsələn: Gecə saatlarında kritik server problemini operativ həll etdi...')}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] focus:border-amber-500/60 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#71717A] focus:outline-none transition-all resize-none"
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
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] focus:border-blue-500 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#71717A] focus:outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Live Score Preview Calculator Card */}
                    <div className="p-4 rounded-2xl bg-zinc-100/90 dark:bg-gradient-to-r dark:from-[#18181B] dark:via-[#1C1C1E] dark:to-[#18181B] border border-zinc-200 dark:border-[#27272A] flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-indigo-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs shrink-0">
                                <Calculator className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-zinc-900 dark:text-white block tracking-tight">{t('kpi.calculatedScore', {}, 'Yekun Hesablanan Bal')}</span>
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

                {/* Fixed Footer */}
                <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-zinc-200 dark:border-[#27272A] bg-zinc-50 dark:bg-[#18181B] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-[#27272A] hover:bg-zinc-300 dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {t('common.cancel', {}, 'Ləğv et')}
                    </button>
                    <button
                        type="submit"
                        form="kpi-submit-form"
                        disabled={!canSubmit}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
