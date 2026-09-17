import React from 'react';
import {
    Calendar,
    ShieldAlert,
    Star,
    ClipboardCheck,
    Pencil,
    Info,
    Inbox,
    UserCheck,
} from 'lucide-react';
import type { DailyKpiDTO } from '../../dto';
import KpiScoreBadge from './KpiScoreBadge';
import { useLanguage } from '../../context/LanguageContext';

interface KpiHistoryTableProps {
    items: DailyKpiDTO[];
    isLoading?: boolean;
    isAdmin?: boolean;
    onEdit?: (kpi: DailyKpiDTO) => void;
    emptyMessage?: string;
}

export const KpiHistoryTable: React.FC<KpiHistoryTableProps> = ({
    items,
    isLoading = false,
    isAdmin = false,
    onEdit,
    emptyMessage,
}) => {
    const { t, language } = useLanguage();

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#71717A] font-medium">{t('kpi.historyTable.loading', {}, 'KPI tarixçəsi yüklənir...')}</p>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#27272A]/60 flex items-center justify-center text-[#71717A]">
                    <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#D4D4D8]">{emptyMessage || t('kpi.historyTable.emptyMessage', {}, 'Heç bir KPI qiymətləndirmə qeydi tapılmadı.')}</p>
                <p className="text-xs text-[#71717A] max-w-sm">
                    {t('kpi.historyTable.emptyDesc', {}, 'Bu dövr üzrə hələ ki qeydə alınmış heç bir KPI qiymətləndirməsi mövcud deyil.')}
                </p>
            </div>
        );
    }

    const locale = language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US';

    return (
        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-[#27272A] bg-[#1C1C1E]/70 text-[#A1A1AA] font-bold">
                            <th className="py-3.5 px-4 sm:px-5">{t('common.date', {}, 'Tarix')}</th>
                            <th className="py-3.5 px-3">{t('kpi.submitModal.dutyTitle', {}, 'Vəzifə Öhdəliyi')}</th>
                            <th className="py-3.5 px-3">{t('kpi.submitModal.disciplineTitle', {}, 'İntizam')}</th>
                            <th className="py-3.5 px-3">{t('kpi.submitModal.bonusTitle', {}, 'Bonus')}</th>
                            <th className="py-3.5 px-3 text-center">{t('kpi.historyTable.totalScore', {}, 'Yekun Bal')}</th>
                            <th className="py-3.5 px-4">{t('kpi.historyTable.evaluator', {}, 'Qiymətləndirən')}</th>
                            <th className="py-3.5 px-4">{t('kpi.historyTable.notesAndReason', {}, 'Qeydlər & Səbəb')}</th>
                            {isAdmin && onEdit && <th className="py-3.5 px-4 text-right">{t('common.actions', {}, 'Əməliyyat')}</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272A]/70 text-[#D4D4D8]">
                        {items.map((item) => {
                            const rawDate = item.evaluationDate || item.date;
                            const formattedDate = rawDate
                                ? new Date(rawDate).toLocaleDateString(locale, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                  })
                                : '—';

                            return (
                                <tr
                                    key={item.id}
                                    className="hover:bg-white/[0.02] transition-colors group"
                                >
                                    {/* Date */}
                                    <td className="py-3.5 px-4 sm:px-5 font-semibold text-white whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                            <span>{formattedDate}</span>
                                            {item.isAdminEdited && (
                                                <span
                                                    title={item.adminEditReason ? `${t('kpi.historyTable.editReason', {}, 'Düzəliş səbəbi')}: ${item.adminEditReason}` : t('kpi.adminEditModal.previouslyEdited', {}, 'Admin tərəfindən düzəliş edilib')}
                                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30"
                                                >
                                                    Audit
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Duty */}
                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                        {(item.jobDutiesScore ?? item.dutyScore) === 1 ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                                <ClipboardCheck className="w-3 h-3" />
                                                +1 {t('kpi.historyTable.dutyDone', {}, 'İcra edilib')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded-lg">
                                                0 {t('kpi.submitModal.dutyNeutral', {}, 'Neytral')}
                                            </span>
                                        )}
                                    </td>

                                    {/* Discipline */}
                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                        {item.disciplineScore === -1 ? (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                                                    <ShieldAlert className="w-3 h-3" />
                                                    -1 {t('kpi.historyTable.penalty', {}, 'Cərimə')}
                                                </span>
                                                {item.disciplinePenaltyReason && (
                                                    <span className="text-[11px] text-rose-400/80 max-w-xs truncate" title={item.disciplinePenaltyReason}>
                                                        {item.disciplinePenaltyReason}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[#71717A] text-[11px] font-medium">0 {t('kpi.historyTable.noViolation', {}, 'Pozuntu yoxdur')}</span>
                                        )}
                                    </td>

                                    {/* Bonus */}
                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                        {item.bonusScore === 1 ? (
                                            <div className="flex flex-col gap-0.5">
                                                <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                                    <Star className="w-3 h-3" />
                                                    +1 {t('kpi.submitModal.bonusShort', {}, 'Bonus')}
                                                </span>
                                                {item.bonusReason && (
                                                    <span className="text-[11px] text-amber-400/80 max-w-xs truncate" title={item.bonusReason}>
                                                        {item.bonusReason}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[#71717A] text-[11px]">0</span>
                                        )}
                                    </td>

                                    {/* Total Score */}
                                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                        <KpiScoreBadge score={item.totalScore} size="sm" showLabel />
                                    </td>

                                    {/* Evaluator */}
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5 text-[#A1A1AA]">
                                            <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                            <span className="truncate max-w-[140px] font-medium text-white">
                                                {item.evaluatorName || t('kpi.historyTable.manager', {}, 'Menecer')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Notes */}
                                    <td className="py-3.5 px-4 max-w-xs">
                                        {(item.comments || item.notes) ? (
                                            <div className="flex items-start gap-1 text-[#A1A1AA]">
                                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#71717A]" />
                                                <span className="truncate" title={item.comments || item.notes || ''}>
                                                    {item.comments || item.notes}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[#52525B] text-[11px]">—</span>
                                        )}
                                        {item.adminEditReason && (
                                            <p className="text-[10px] text-purple-400/90 mt-0.5 truncate" title={`Admin Düzəlişi: ${item.adminEditReason}`}>
                                                Audit: {item.adminEditReason}
                                            </p>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    {isAdmin && onEdit && (
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(item)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-purple-600/20 hover:text-purple-300 text-xs font-semibold text-[#A1A1AA] transition-colors cursor-pointer border border-[#3F3F46]/60"
                                                title={t('kpi.adminEditModal.title', {}, 'Admin Redaktə')}
                                            >
                                                <Pencil className="w-3 h-3" />
                                                <span>{t('common.edit', {}, 'Düzəliş')}</span>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KpiHistoryTable;
